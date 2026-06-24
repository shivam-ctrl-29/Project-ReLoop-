import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        ew.id, ew.listing_code, ew.item_name, ew.category, ew.condition,
        ew.ai_price_min, ew.ai_price_max, ew.status, ew.created_at,
        u.name AS seller_name
      FROM ewaste_listings ew
      JOIN users u ON u.id = ew.user_id
      WHERE ew.buyer_id = $1
      ORDER BY ew.created_at DESC
    `, [userId]);
    return NextResponse.json(result.rows);
  } finally {
    client.release();
  }
}
