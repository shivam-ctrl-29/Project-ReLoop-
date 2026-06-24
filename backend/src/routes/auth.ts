import { Router, Request, Response } from 'express';
import pool from '../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' }); return;
  }
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT u.*, i.name AS institution_name
       FROM users u LEFT JOIN institutions i ON i.id = u.institution_id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );
    if (result.rows.length === 0) { res.status(401).json({ error: 'No account found with this email.' }); return; }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) { res.status(401).json({ error: 'Incorrect password.' }); return; }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.cookie('reloop_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, institution: user.institution_name } });
  } finally { client.release(); }
});

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  const { name, email, password, role, institution, department, docType, docName } = req.body;
  if (!name || !email || !password || !role) { res.status(400).json({ error: 'Name, email, password and role are required.' }); return; }
  if (password.length < 8) { res.status(400).json({ error: 'Password must be at least 8 characters.' }); return; }

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) { res.status(409).json({ error: 'An account with this email already exists.' }); return; }

    let institutionId = null;
    if (institution) {
      const inst = await client.query(`INSERT INTO institutions (name, city) VALUES ($1, 'Indore') ON CONFLICT DO NOTHING RETURNING id`, [institution]);
      if (inst.rows.length > 0) { institutionId = inst.rows[0].id; }
      else { const found = await client.query('SELECT id FROM institutions WHERE name = $1', [institution]); institutionId = found.rows[0]?.id || null; }
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role, institution_id, department) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, role, department`,
      [name.trim(), email.toLowerCase().trim(), hash, role, institutionId, department || null]
    );
    const user = result.rows[0];

    if (role === 'buyer' && docType && docName) {
      await client.query(
        `INSERT INTO compliance_docs (doc_code, user_id, doc_type, doc_name, issued_date, status, file_url) VALUES ($1,$2,$3,$4,NOW(),'valid',$5)`,
        [`DOC-${user.id}-${Math.floor(Math.random() * 10000)}`, user.id, docType, docName, `/mock-uploads/${docName}`]
      );
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('reloop_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
    res.status(201).json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, institution } });
  } finally { client.release(); }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('reloop_token', { path: '/' });
  res.json({ success: true });
});

export default router;
