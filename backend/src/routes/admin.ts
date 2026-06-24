import { Router, Request, Response, NextFunction } from 'express';
import pool from '../../lib/db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Only admins can access these routes
router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: admin access required' });
    return;
  }
  next();
});

// GET /api/admin/pickups
router.get('/pickups', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const client = await pool.connect();
  try {
    const instRes = await client.query('SELECT institution_id FROM users WHERE id=$1', [userId]);
    const institutionId = instRes.rows[0]?.institution_id ?? 1;
    const result = await client.query(`
      SELECT p.id, p.pickup_type, p.quantity, p.scheduled_date, p.time_slot,
             p.status, p.driver_name, p.revenue, p.buyer_name,
             p.tpc_reading, p.verified_grade, p.verified_quantity, p.driver_note,
             u.name AS seller_name, u.department
      FROM pickups p JOIN users u ON u.id=p.user_id
      WHERE u.institution_id=$1 ORDER BY p.scheduled_date DESC`, [institutionId]);
    res.json({ pickups: result.rows });
  } finally { client.release(); }
});

// PATCH /api/admin/pickups
router.patch('/pickups', async (req: Request, res: Response) => {
  const { id, tpc_reading, verified_grade, verified_quantity, driver_note, driver_name } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE pickups SET tpc_reading=$1, verified_grade=$2, verified_quantity=$3,
        driver_note=$4, status='confirmed', driver_name=COALESCE($5, driver_name)
      WHERE id=$6 RETURNING *`,
      [tpc_reading, verified_grade, verified_quantity, driver_note, driver_name, id]);
    if (result.rows[0]?.listing_id && verified_grade) {
      await client.query('UPDATE oil_listings SET grade=$1 WHERE id=$2', [verified_grade, result.rows[0].listing_id]);
    }
    res.json(result.rows[0]);
  } finally { client.release(); }
});

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const client = await pool.connect();
  try {
    const instRes = await client.query('SELECT institution_id FROM users WHERE id=$1', [userId]);
    const institutionId = instRes.rows[0]?.institution_id ?? 1;
    const result = await client.query(`SELECT id, name, email, role, department, created_at FROM users WHERE institution_id=$1 ORDER BY created_at DESC`, [institutionId]);
    res.json(result.rows);
  } finally { client.release(); }
});

export default router;
