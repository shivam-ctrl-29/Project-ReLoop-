import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { name, email, password, role, institution, department, phone } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Name, email, password and role are required.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Find or create institution
    let institutionId = null;
    if (institution) {
      const inst = await client.query(
        `INSERT INTO institutions (name, city) VALUES ($1, 'Indore')
         ON CONFLICT DO NOTHING RETURNING id`,
        [institution]
      );
      if (inst.rows.length > 0) {
        institutionId = inst.rows[0].id;
      } else {
        const found = await client.query('SELECT id FROM institutions WHERE name = $1', [institution]);
        institutionId = found.rows[0]?.id || null;
      }
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role, institution_id, department)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, department`,
      [name.trim(), email.toLowerCase().trim(), hash, role, institutionId, department || null]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, institution },
    }, { status: 201 });

    res.cookies.set('reloop_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return res;
  } finally {
    client.release();
  }
}
