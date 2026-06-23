import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const role = authUser?.role ?? 'buyer';
  const isBuyer = role === 'buyer';
  const client = await pool.connect();
  try {
    const institutionRes = await client.query('SELECT institution_id FROM users WHERE id = $1', [userId]);
    const institutionId = institutionRes.rows[0]?.institution_id ?? 1;

    const [listings, stats] = await Promise.all([
      isBuyer
        ? client.query(`
            SELECT ew.id, ew.listing_code, ew.item_name, ew.category, ew.brand, ew.condition,
                   ew.ai_triage, ew.ai_price_min, ew.ai_price_max, ew.status,
                   u.name AS seller_name
            FROM ewaste_listings ew
            JOIN users u ON u.id = ew.user_id
            WHERE ew.status IN ('listed','matched')
            ORDER BY ew.created_at DESC
          `, [])
        : client.query(`
            SELECT listing_code, item_name, category, brand, condition,
                   ai_triage, ai_price_min, ai_price_max, status
            FROM ewaste_listings WHERE user_id = $1
            ORDER BY created_at DESC
          `, [userId]),
      client.query(`
        SELECT
          COUNT(*) AS total_items,
          COUNT(*) FILTER (WHERE status='matched') AS matched,
          COUNT(*) FILTER (WHERE ai_triage='recycle') AS recycled,
          (SELECT revenue_ewaste FROM impact_records WHERE institution_id=$1 ORDER BY recorded_month DESC LIMIT 1) AS revenue
        FROM ewaste_listings WHERE ${isBuyer ? "status IN ('listed','matched')" : `user_id = ${userId}`}
      `, [institutionId]),
    ]);
    return NextResponse.json({ listings: listings.rows, stats: stats.rows[0] });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const body = await req.json();
  const { item_name, category, brand, condition, ai_triage, ai_price_min, ai_price_max } = body;
  const client = await pool.connect();
  try {
    const count = await client.query('SELECT COUNT(*) FROM ewaste_listings');
    const code = `EW-${String(Number(count.rows[0].count) + 1).padStart(3, '0')}`;
    const result = await client.query(
      `INSERT INTO ewaste_listings (listing_code, user_id, item_name, category, brand, condition, ai_triage, ai_price_min, ai_price_max, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'listed') RETURNING *`,
      [code, userId, item_name, category, brand, condition, ai_triage, ai_price_min, ai_price_max]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } finally {
    client.release();
  }
}
