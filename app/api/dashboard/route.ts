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

    const [pickups, chart, stats] = await Promise.all([
      client.query(`
        SELECT scheduled_date, quantity, status, revenue, buyer_name, pickup_type
        FROM pickups WHERE user_id = $1
        ORDER BY scheduled_date DESC LIMIT 5
      `, [userId]),
      client.query(`
        SELECT TO_CHAR(recorded_month, 'Mon') AS month, oil_collected_liters AS val
        FROM impact_records WHERE institution_id = $1
        ORDER BY recorded_month ASC
      `, [institutionId]),
      client.query(`
        SELECT
          (SELECT COALESCE(SUM(oil_collected_liters),0) FROM impact_records WHERE institution_id=$1) AS oil_kg,
          (SELECT COALESCE(SUM(revenue_oil),0) FROM impact_records WHERE institution_id=$1) AS earnings,
          (SELECT COALESCE(SUM(co2_saved_tons),0) FROM impact_records WHERE institution_id=$1) AS co2,
          (SELECT COUNT(*) FROM compliance_docs WHERE user_id=$2 AND status='valid') AS docs
      `, [institutionId, userId]),
    ]);
    return NextResponse.json({ stats: stats.rows[0], pickups: pickups.rows, chart: chart.rows });
  } finally {
    client.release();
  }
}
