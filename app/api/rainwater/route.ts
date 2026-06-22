import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const [buildings, rainfall, stats] = await Promise.all([
      client.query(`
        SELECT name, catchment_area_m2, runoff_coefficient,
               ROUND(catchment_area_m2 * 120 * runoff_coefficient) AS monthly_potential
        FROM buildings WHERE institution_id = 1
        ORDER BY catchment_area_m2 DESC
      `),
      client.query(`
        SELECT TO_CHAR(recorded_month, 'Mon') AS month,
               COALESCE(SUM(harvested_liters),0) AS harvested
        FROM rainfall_records rr
        JOIN buildings b ON b.id = rr.building_id
        WHERE b.institution_id = 1
        GROUP BY recorded_month ORDER BY recorded_month ASC
      `),
      client.query(`
        SELECT
          water_saved_liters,
          co2_saved_tons
        FROM impact_records WHERE institution_id=1 AND recorded_month='2026-06-01'
      `),
    ]);
    return NextResponse.json({ buildings: buildings.rows, rainfall: rainfall.rows, stats: stats.rows[0] });
  } finally {
    client.release();
  }
}
