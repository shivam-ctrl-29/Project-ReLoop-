import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const [monthly, totals, depts] = await Promise.all([
      client.query(`
        SELECT TO_CHAR(recorded_month, 'Mon') AS month,
               co2_saved_tons AS co2,
               water_saved_liters AS water,
               revenue_oil + revenue_ewaste AS revenue,
               revenue_oil AS oil,
               revenue_ewaste AS ewaste
        FROM impact_records WHERE institution_id = 1
        ORDER BY recorded_month ASC
      `),
      client.query(`
        SELECT
          SUM(co2_saved_tons) AS total_co2,
          SUM(water_saved_liters) AS total_water,
          SUM(revenue_oil + revenue_ewaste) AS total_revenue,
          SUM(oil_collected_liters + ewaste_items * 5) AS total_items
        FROM impact_records WHERE institution_id = 1
      `),
      client.query(`
        SELECT u.department,
               COALESCE(SUM(oil.quantity_liters),0) AS oil,
               COUNT(ew.id) AS ewaste
        FROM users u
        LEFT JOIN oil_listings oil ON oil.user_id = u.id
        LEFT JOIN ewaste_listings ew ON ew.user_id = u.id
        WHERE u.institution_id = 1
        GROUP BY u.department
        ORDER BY oil DESC
        LIMIT 5
      `),
    ]);
    return NextResponse.json({ monthly: monthly.rows, totals: totals.rows[0], depts: depts.rows });
  } finally {
    client.release();
  }
}
