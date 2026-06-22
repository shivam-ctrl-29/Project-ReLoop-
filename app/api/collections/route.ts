import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const [history, stats, chart] = await Promise.all([
      client.query(`
        SELECT id, pickup_type, quantity, scheduled_date,
               status, revenue, buyer_name
        FROM pickups WHERE user_id = 1 AND status = 'collected'
        ORDER BY scheduled_date DESC
      `),
      client.query(`
        SELECT
          COUNT(*) AS total,
          COALESCE(SUM(CASE WHEN pickup_type='oil' THEN REPLACE(quantity,' L','')::numeric ELSE 0 END),0) AS total_oil,
          COUNT(*) FILTER (WHERE pickup_type='ewaste') AS total_ewaste_pickups,
          COALESCE(SUM(revenue),0) AS total_revenue
        FROM pickups WHERE user_id = 1 AND status = 'collected'
      `),
      client.query(`
        SELECT TO_CHAR(recorded_month, 'Mon') AS month,
               revenue_oil AS oil,
               revenue_ewaste AS ewaste
        FROM impact_records WHERE institution_id = 1
        ORDER BY recorded_month ASC
      `),
    ]);
    return NextResponse.json({ history: history.rows, stats: stats.rows[0], chart: chart.rows });
  } finally {
    client.release();
  }
}
