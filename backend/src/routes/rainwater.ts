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
    const [buildings, rainfall, stats] = await Promise.all([
      client.query(`SELECT name, catchment_area_m2, runoff_coefficient,
                           ROUND(catchment_area_m2*120*runoff_coefficient) AS monthly_potential
                    FROM buildings WHERE institution_id=$1 ORDER BY catchment_area_m2 DESC`, [institutionId]),
      client.query(`SELECT TO_CHAR(recorded_month,'Mon') AS month, COALESCE(SUM(harvested_liters),0) AS harvested
                    FROM rainfall_records rr JOIN buildings b ON b.id=rr.building_id
                    WHERE b.institution_id=$1 GROUP BY recorded_month ORDER BY recorded_month ASC`, [institutionId]),
      client.query(`SELECT water_saved_liters, co2_saved_tons FROM impact_records WHERE institution_id=$1 ORDER BY recorded_month DESC LIMIT 1`, [institutionId]),
    ]);
    res.json({ buildings: buildings.rows, rainfall: rainfall.rows, stats: stats.rows[0] });
  } finally { client.release(); }
});

export default router;
