import { Router, Request, Response } from 'express';
import pool from '../../lib/db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, pickup_type, quantity, scheduled_date, time_slot,
             status, driver_name, revenue, buyer_name,
             tpc_reading, verified_grade, verified_quantity, driver_note
      FROM pickups WHERE user_id=$1 ORDER BY scheduled_date DESC`, [userId]);
    res.json({ pickups: result.rows });
  } finally { client.release(); }
});

router.post('/', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const { pickup_type, quantity, scheduled_date, time_slot } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO pickups (user_id, pickup_type, quantity, scheduled_date, time_slot, status, location)
       VALUES ($1,$2,$3,$4,$5,'requested','Symbiosis University, Indore') RETURNING *`,
      [userId, pickup_type, quantity, scheduled_date, time_slot]
    );
    res.status(201).json(result.rows[0]);
  } finally { client.release(); }
});

router.patch('/', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const { id, status, tpc_reading, verified_grade, verified_quantity, driver_note, driver_name } = req.body;
  const client = await pool.connect();
  try {
    if (tpc_reading !== undefined) {
      const result = await client.query(
        `UPDATE pickups SET tpc_reading=$1, verified_grade=$2, verified_quantity=$3,
          driver_note=$4, status='confirmed', driver_name=COALESCE($5, driver_name)
         WHERE id=$6 AND user_id=$7 RETURNING *`,
        [tpc_reading, verified_grade, verified_quantity, driver_note, driver_name, id, userId]
      );
      if (verified_grade && result.rows[0]?.listing_id) {
        await client.query('UPDATE oil_listings SET grade=$1 WHERE id=$2', [verified_grade, result.rows[0].listing_id]);
      }
      res.json(result.rows[0]); return;
    }
    const result = await client.query('UPDATE pickups SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING *', [status, id, userId]);
    res.json(result.rows[0]);
  } finally { client.release(); }
});

export default router;
