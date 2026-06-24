import { Router, Request, Response } from 'express';
import pool from '../../lib/db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/oil
router.get('/', async (req: Request, res: Response) => {
  const { id: userId, role } = req.user!;
  const isBuyer = role === 'buyer';
  const client = await pool.connect();
  try {
    const instRes = await client.query('SELECT institution_id FROM users WHERE id=$1', [userId]);
    const institutionId = instRes.rows[0]?.institution_id ?? 1;
    const [listings, chart, stats] = await Promise.all([
      isBuyer
        ? client.query(`
            SELECT ol.id, ol.listing_code, ol.oil_type, ol.quantity_liters, ol.grade,
                   ol.ai_price_min, ol.ai_price_max, ol.status, u.name AS seller_name,
                   (SELECT COUNT(*) FROM oil_bids WHERE listing_id = ol.id) AS bids,
                   (SELECT bid_price FROM oil_bids WHERE listing_id = ol.id AND buyer_id = $1 LIMIT 1) AS my_bid
            FROM oil_listings ol JOIN users u ON u.id = ol.user_id
            WHERE ol.status IN ('active','matched') ORDER BY ol.created_at DESC`, [userId])
        : client.query(`
            SELECT listing_code, oil_type, quantity_liters, grade, ai_price_min, ai_price_max, status,
                   (SELECT COUNT(*) FROM oil_bids WHERE listing_id = ol.id) AS bids
            FROM oil_listings ol WHERE user_id=$1 ORDER BY created_at DESC`, [userId]),
      client.query(`
        SELECT TO_CHAR(recorded_month,'"W"') || EXTRACT(MONTH FROM recorded_month)::text AS week,
               oil_collected_liters AS oil
        FROM impact_records WHERE institution_id=$1 ORDER BY recorded_month DESC LIMIT 6`, [institutionId]),
      client.query(`
        SELECT COUNT(*) FILTER (WHERE status='active') AS active_listings,
          (SELECT revenue_oil FROM impact_records WHERE institution_id=$1 ORDER BY recorded_month DESC LIMIT 1) AS revenue,
          (SELECT oil_collected_liters FROM impact_records WHERE institution_id=$1 ORDER BY recorded_month DESC LIMIT 1) AS diverted
        FROM oil_listings WHERE ${isBuyer ? "status IN ('active','matched')" : `user_id=${userId}`}`, [institutionId]),
    ]);
    res.json({ listings: listings.rows, chart: chart.rows, stats: stats.rows[0] });
  } finally { client.release(); }
});

// POST /api/oil
router.post('/', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const { oil_type, quantity_liters, grade, ai_price_min, ai_price_max } = req.body;
  const client = await pool.connect();
  try {
    const count = await client.query('SELECT COUNT(*) FROM oil_listings');
    const code = `OIL-${String(Number(count.rows[0].count) + 1).padStart(3, '0')}`;
    const result = await client.query(
      `INSERT INTO oil_listings (listing_code, user_id, oil_type, quantity_liters, grade, ai_price_min, ai_price_max, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'active') RETURNING *`,
      [code, userId, oil_type, quantity_liters, grade, ai_price_min, ai_price_max]
    );
    res.status(201).json(result.rows[0]);
  } finally { client.release(); }
});

// GET /api/oil/bids
router.get('/bids', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT ob.id, ob.bid_price, ob.status, ob.created_at,
             ol.listing_code, ol.oil_type, ol.quantity_liters, ol.grade,
             ol.ai_price_min, ol.ai_price_max, ol.status AS listing_status,
             u.name AS seller_name
      FROM oil_bids ob
      JOIN oil_listings ol ON ol.id = ob.listing_id
      JOIN users u ON u.id = ol.user_id
      WHERE ob.buyer_id=$1 ORDER BY ob.created_at DESC`, [userId]);
    res.json(result.rows);
  } finally { client.release(); }
});

// POST /api/oil/bids
router.post('/bids', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const { listing_id, bid_price } = req.body;
  if (!listing_id || !bid_price) { res.status(400).json({ error: 'Missing fields' }); return; }
  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM oil_bids WHERE listing_id=$1 AND buyer_id=$2', [listing_id, userId]);
    if (existing.rows.length > 0) {
      const updated = await client.query('UPDATE oil_bids SET bid_price=$1, status=$2 WHERE listing_id=$3 AND buyer_id=$4 RETURNING *', [bid_price, 'pending', listing_id, userId]);
      res.json(updated.rows[0]); return;
    }
    const result = await client.query('INSERT INTO oil_bids (listing_id, buyer_id, bid_price, status) VALUES ($1,$2,$3,$4) RETURNING *', [listing_id, userId, bid_price, 'pending']);
    res.status(201).json(result.rows[0]);
  } finally { client.release(); }
});

export default router;
