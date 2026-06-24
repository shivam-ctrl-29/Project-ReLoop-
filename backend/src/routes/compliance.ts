import { Router, Request, Response } from 'express';
import pool from '../../lib/db';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const { id: userId } = req.user!;
  const client = await pool.connect();
  try {
    const [docs, stats] = await Promise.all([
      client.query(`SELECT doc_code, doc_name, issued_date, expires_date, quantity, buyer_name, status, doc_type
                    FROM compliance_docs WHERE user_id=$1 ORDER BY issued_date DESC`, [userId]),
      client.query(`SELECT COUNT(*) FILTER (WHERE status='valid') AS valid_count, COUNT(*) AS total_count,
                           COUNT(*) FILTER (WHERE doc_type IN ('fssai','cpcb')) AS epr_count,
                           COUNT(*) FILTER (WHERE doc_type='ewaste_auth') AS ewaste_count,
                           COUNT(*) FILTER (WHERE doc_type='esg_report') AS esg_count
                    FROM compliance_docs WHERE user_id=$1`, [userId]),
    ]);
    res.json({ docs: docs.rows, stats: stats.rows[0] });
  } finally { client.release(); }
});

export default router;
