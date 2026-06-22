import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const [pickups, chart, stats] = await Promise.all([
      client.query(`
        SELECT scheduled_date, quantity, status, revenue, buyer_name, pickup_type
        FROM pickups WHERE user_id = 1
        ORDER BY scheduled_date DESC LIMIT 5
      `),
      client.query(`
        SELECT TO_CHAR(recorded_month, 'Mon') AS month,
               oil_collected_liters AS val
        FROM impact_records WHERE institution_id = 1
        ORDER BY recorded_month ASC
      `),
      client.query(`
        SELECT
          (SELECT COALESCE(SUM(oil_collected_liters),0) FROM impact_records WHERE institution_id=1 AND recorded_month='2026-06-01') AS oil_kg,
          (SELECT COALESCE(SUM(revenue_oil),0) FROM impact_records WHERE institution_id=1 AND recorded_month='2026-06-01') AS earnings,
          (SELECT COALESCE(SUM(co2_saved_tons),0) FROM impact_records WHERE institution_id=1 AND recorded_month='2026-06-01') AS co2,
          (SELECT COUNT(*) FROM compliance_docs WHERE user_id=1 AND status='valid') AS docs
      `),
    ]);

    return NextResponse.json({
      stats: stats.rows[0],
      pickups: pickups.rows,
      chart: chart.rows,
    });
  } finally {
    client.release();
  }
}
