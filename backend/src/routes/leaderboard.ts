import { Router, Request, Response } from 'express';
import pool from '../../lib/db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT u.id, u.name, u.role, u.department,
        COALESCE(p.pickups,0) AS pickups, COALESCE(p.revenue,0) AS revenue,
        COALESCE(p.oil_liters,0) AS oil_liters, COALESCE(ew.ewaste_items,0) AS ewaste_items,
        COALESCE(ol.oil_listings,0) AS oil_listings, COALESCE(ob.bids_placed,0) AS bids_placed
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS pickups, SUM(COALESCE(revenue,0)) AS revenue,
          SUM(CASE WHEN pickup_type='oil' THEN REGEXP_REPLACE(quantity,'[^0-9.]','','g')::numeric ELSE 0 END) AS oil_liters
        FROM pickups WHERE status IN ('collected','confirmed') GROUP BY user_id
      ) p ON p.user_id = u.id
      LEFT JOIN (SELECT user_id, COUNT(*) AS ewaste_items FROM ewaste_listings GROUP BY user_id) ew ON ew.user_id = u.id
      LEFT JOIN (SELECT user_id, COUNT(*) AS oil_listings FROM oil_listings GROUP BY user_id) ol ON ol.user_id = u.id
      LEFT JOIN (SELECT buyer_id, COUNT(*) AS bids_placed FROM oil_bids GROUP BY buyer_id) ob ON ob.buyer_id = u.id
      WHERE COALESCE(p.pickups,0)>0 OR COALESCE(ew.ewaste_items,0)>0
         OR COALESCE(ol.oil_listings,0)>0 OR COALESCE(ob.bids_placed,0)>0
      ORDER BY revenue DESC, pickups DESC, oil_liters DESC LIMIT 10
    `);
    res.json(result.rows);
  } finally { client.release(); }
});

export default router;
