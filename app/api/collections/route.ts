import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const client = await pool.connect();
  try {
    const institutionRes = await client.query('SELECT institution_id FROM users WHERE id = $1', [userId]);
    const institutionId = institutionRes.rows[0]?.institution_id ?? 1;

    const [history, stats, chart] = await Promise.all([
      client.query(`
        SELECT id, pickup_type, quantity, scheduled_date, status, revenue, buyer_name
        FROM pickups WHERE user_id = $1 AND status = 'collected'
        ORDER BY scheduled_date DESC
      `, [userId]),
      client.query(`
        SELECT
          COUNT(*) AS total,
          COALESCE(SUM(CASE WHEN pickup_type='oil' THEN REPLACE(quantity,' L','')::numeric ELSE 0 END),0) AS total_oil,
          COUNT(*) FILTER (WHERE pickup_type='ewaste') AS total_ewaste_pickups,
          COALESCE(SUM(revenue),0) AS total_revenue
        FROM pickups WHERE user_id = $1 AND status = 'collected'
      `, [userId]),
      client.query(`
        SELECT TO_CHAR(recorded_month, 'Mon') AS month, revenue_oil AS oil, revenue_ewaste AS ewaste
        FROM impact_records WHERE institution_id = $1
        ORDER BY recorded_month ASC
      `, [institutionId]),
    ]);
    return NextResponse.json({ history: history.rows, stats: stats.rows[0], chart: chart.rows });
  } finally {
    client.release();
  }
}
