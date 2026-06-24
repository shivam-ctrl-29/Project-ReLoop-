import { Router, Request, Response } from 'express';
import pool from '../../lib/db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const { id: userId, role } = req.user!;
  const isAdmin = role === 'admin';
  const client = await pool.connect();
  try {
    const instRes = await client.query('SELECT institution_id FROM users WHERE id=$1', [userId]);
    const institutionId = instRes.rows[0]?.institution_id ?? 1;
    const sellerFilter = isAdmin ? `ol.user_id IN (SELECT id FROM users WHERE institution_id=${institutionId})` : `ol.user_id=${userId}`;
    const ewFilter = isAdmin ? `user_id IN (SELECT id FROM users WHERE institution_id=${institutionId})` : `user_id=${userId}`;

    const [oilBids, ewaste, oilListings, stats] = await Promise.all([
      client.query(`
        SELECT ob.id AS bid_id, ob.bid_price, ob.status AS bid_status, ob.created_at,
               ol.id AS listing_id, ol.listing_code, ol.oil_type, ol.quantity_liters, ol.grade,
               ol.ai_price_min, ol.ai_price_max, ol.status AS listing_status,
               seller.name AS seller_name, buyer.name AS buyer_name, buyer.email AS buyer_email,
               EXISTS(SELECT 1 FROM compliance_docs cd WHERE cd.user_id=buyer.id AND cd.status='valid') AS buyer_verified
        FROM oil_bids ob
        JOIN oil_listings ol ON ol.id=ob.listing_id
        JOIN users seller ON seller.id=ol.user_id
        JOIN users buyer ON buyer.id=ob.buyer_id
        WHERE ${sellerFilter} ORDER BY ob.created_at DESC`),
      client.query(`SELECT ew.listing_code, ew.item_name, ew.category, ew.brand, ew.condition,
                           ew.ai_triage, ew.ai_price_min, ew.ai_price_max, ew.status, ew.created_at, u.name AS seller_name
                    FROM ewaste_listings ew JOIN users u ON u.id=ew.user_id WHERE ${ewFilter} ORDER BY ew.created_at DESC`),
      client.query(`SELECT ol.listing_code, ol.oil_type, ol.quantity_liters, ol.grade,
                           ol.ai_price_min, ol.ai_price_max, ol.status, ol.created_at, u.name AS seller_name,
                           (SELECT COUNT(*) FROM oil_bids WHERE listing_id=ol.id) AS bid_count
                    FROM oil_listings ol JOIN users u ON u.id=ol.user_id WHERE ${sellerFilter} ORDER BY ol.created_at DESC`),
      client.query(`SELECT
          (SELECT COUNT(*) FROM oil_listings WHERE ${isAdmin ? `user_id IN (SELECT id FROM users WHERE institution_id=${institutionId})` : `user_id=${userId}`} AND status='active') AS active_oil,
          (SELECT COUNT(*) FROM ewaste_listings WHERE ${isAdmin ? `user_id IN (SELECT id FROM users WHERE institution_id=${institutionId})` : `user_id=${userId}`} AND status='listed') AS active_ewaste,
          (SELECT COUNT(*) FROM oil_bids ob JOIN oil_listings ol ON ol.id=ob.listing_id WHERE ${sellerFilter} AND ob.status='pending') AS pending_bids,
          (SELECT COUNT(*) FROM oil_bids ob JOIN oil_listings ol ON ol.id=ob.listing_id WHERE ${sellerFilter} AND ob.status='accepted') AS accepted_bids`),
    ]);
    res.json({ oilBids: oilBids.rows, ewasteListings: ewaste.rows, oilListings: oilListings.rows, stats: stats.rows[0] });
  } finally { client.release(); }
});

router.patch('/', async (req: Request, res: Response) => {
  const { id: userId, role } = req.user!;
  const { bid_id, action } = req.body;
  if (!bid_id || !['accept','reject'].includes(action)) { res.status(400).json({ error: 'Invalid request' }); return; }
  const isAdmin = role === 'admin';
  const client = await pool.connect();
  try {
    const instRes = await client.query('SELECT institution_id FROM users WHERE id=$1', [userId]);
    const institutionId = instRes.rows[0]?.institution_id ?? 1;
    const check = isAdmin
      ? await client.query(`SELECT ob.id FROM oil_bids ob JOIN oil_listings ol ON ol.id=ob.listing_id JOIN users u ON u.id=ol.user_id WHERE ob.id=$1 AND u.institution_id=$2`, [bid_id, institutionId])
      : await client.query(`SELECT ob.id FROM oil_bids ob JOIN oil_listings ol ON ol.id=ob.listing_id WHERE ob.id=$1 AND ol.user_id=$2`, [bid_id, userId]);
    if (check.rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await client.query('UPDATE oil_bids SET status=$1 WHERE id=$2', [newStatus, bid_id]);
    if (action === 'accept') await client.query(`UPDATE oil_listings SET status='matched' WHERE id=(SELECT listing_id FROM oil_bids WHERE id=$1)`, [bid_id]);
    res.json({ success: true, status: newStatus });
  } finally { client.release(); }
});

export default router;
