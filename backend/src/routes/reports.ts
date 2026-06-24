import { Router, Request, Response } from 'express';
import pool from '../../lib/db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const client = await pool.connect();
  try {
    const instRes = await client.query('SELECT institution_id FROM users WHERE id=$1', [userId]);
    const institutionId = instRes.rows[0]?.institution_id ?? 1;
    const [monthly, totals, depts] = await Promise.all([
      client.query(`SELECT TO_CHAR(recorded_month,'Mon') AS month, co2_saved_tons AS co2_saved,
                           water_saved_liters AS water_saved, revenue_oil+revenue_ewaste AS revenue,
                           oil_collected_liters AS oil_collected, ewaste_items
                    FROM impact_records WHERE institution_id=$1 ORDER BY recorded_month ASC`, [institutionId]),
      client.query(`SELECT COALESCE(SUM(co2_saved_tons),0) AS total_co2, COALESCE(SUM(water_saved_liters),0) AS total_water,
                           COALESCE(SUM(revenue_oil+revenue_ewaste),0) AS total_revenue,
                           COALESCE(SUM(oil_collected_liters),0) AS total_oil, COALESCE(SUM(ewaste_items),0) AS total_items
                    FROM impact_records WHERE institution_id=$1`, [institutionId]),
      client.query(`SELECT u.department, COALESCE(SUM(oil.quantity_liters),0) AS oil, COUNT(ew.id) AS ewaste
                    FROM users u
                    LEFT JOIN oil_listings oil ON oil.user_id=u.id
                    LEFT JOIN ewaste_listings ew ON ew.user_id=u.id
                    WHERE u.institution_id=$1 GROUP BY u.department ORDER BY oil DESC LIMIT 5`, [institutionId]),
    ]);
    res.json({ monthly: monthly.rows, totals: totals.rows[0], depts: depts.rows });
  } finally { client.release(); }
});

export default router;
