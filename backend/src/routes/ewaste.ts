import { Router, Request, Response } from 'express';
import pool from '../../lib/db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/ewaste
router.get('/', async (req: Request, res: Response) => {
  const { id: userId, role } = req.user!;
  const isBuyer = role === 'buyer';
  const client = await pool.connect();
  try {
    const instRes = await client.query('SELECT institution_id FROM users WHERE id=$1', [userId]);
    const institutionId = instRes.rows[0]?.institution_id ?? 1;
    const [listings, stats] = await Promise.all([
      isBuyer
        ? client.query(`SELECT ew.id, ew.listing_code, ew.item_name, ew.category, ew.brand, ew.condition,
                               ew.ai_triage, ew.ai_price_min, ew.ai_price_max, ew.status, u.name AS seller_name
                        FROM ewaste_listings ew JOIN users u ON u.id = ew.user_id
                        WHERE ew.status IN ('listed','matched') ORDER BY ew.created_at DESC`)
        : client.query(`SELECT listing_code, item_name, category, brand, condition,
                               ai_triage, ai_price_min, ai_price_max, status
                        FROM ewaste_listings WHERE user_id=$1 ORDER BY created_at DESC`, [userId]),
      client.query(`
        SELECT COUNT(*) AS total_items, COUNT(*) FILTER (WHERE status='matched') AS matched,
               COUNT(*) FILTER (WHERE ai_triage='recycle') AS recycled,
               (SELECT revenue_ewaste FROM impact_records WHERE institution_id=$1 ORDER BY recorded_month DESC LIMIT 1) AS revenue
        FROM ewaste_listings WHERE ${isBuyer ? "status IN ('listed','matched')" : `user_id=${userId}`}`, [institutionId]),
    ]);
    res.json({ listings: listings.rows, stats: stats.rows[0] });
  } finally { client.release(); }
});

// POST /api/ewaste
router.post('/', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const { item_name, category, brand, condition, ai_triage, ai_price_min, ai_price_max } = req.body;
  const client = await pool.connect();
  try {
    const count = await client.query('SELECT COUNT(*) FROM ewaste_listings');
    const code = `EW-${String(Number(count.rows[0].count) + 1).padStart(3, '0')}`;
    const result = await client.query(
      `INSERT INTO ewaste_listings (listing_code, user_id, item_name, category, brand, condition, ai_triage, ai_price_min, ai_price_max, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'listed') RETURNING *`,
      [code, userId, item_name, category, brand, condition, ai_triage, ai_price_min, ai_price_max]
    );
    res.status(201).json(result.rows[0]);
  } finally { client.release(); }
});

// GET /api/ewaste/orders
router.get('/orders', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT ew.listing_code, ew.item_name, ew.category, ew.condition,
             ew.ai_price_min, ew.ai_price_max, u.name AS seller_name
      FROM ewaste_listings ew JOIN users u ON u.id = ew.user_id
      WHERE ew.buyer_id=$1 ORDER BY ew.created_at DESC`, [userId]);
    res.json(result.rows);
  } finally { client.release(); }
});

// POST /api/ewaste/buy
router.post('/buy', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const { listing_id } = req.body;
  if (!listing_id) { res.status(400).json({ error: 'Missing listing_id' }); return; }
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE ewaste_listings SET status='matched', buyer_id=$1 WHERE id=$2 AND status='listed' RETURNING *`,
      [userId, listing_id]
    );
    if (result.rows.length === 0) { res.status(404).json({ error: 'Listing not available' }); return; }
    res.json(result.rows[0]);
  } finally { client.release(); }
});

export default router;
