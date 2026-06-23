import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        u.id, u.name, u.role, u.department,
        COUNT(DISTINCT p.id) AS pickups,
        COALESCE(SUM(p.revenue), 0) AS revenue,
        COALESCE(SUM(CASE WHEN p.pickup_type='oil' THEN REPLACE(p.quantity,' L','')::numeric ELSE 0 END), 0) AS oil_liters,
        COUNT(DISTINCT el.id) AS ewaste_items,
        COUNT(DISTINCT ol.id) AS oil_listings
      FROM users u
      LEFT JOIN pickups p ON p.user_id = u.id AND p.status = 'collected'
      LEFT JOIN ewaste_listings el ON el.user_id = u.id
      LEFT JOIN oil_listings ol ON ol.user_id = u.id
      GROUP BY u.id, u.name, u.role, u.department
      ORDER BY pickups DESC, revenue DESC
      LIMIT 10
    `);
    return NextResponse.json(result.rows);
  } finally {
    client.release();
  }
}
