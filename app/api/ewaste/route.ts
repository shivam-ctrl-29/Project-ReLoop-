import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const [listings, stats] = await Promise.all([
      client.query(`
        SELECT listing_code, item_name, category, brand, condition,
               ai_triage, ai_price_min, ai_price_max, status
        FROM ewaste_listings WHERE user_id = 1
        ORDER BY created_at DESC
      `),
      client.query(`
        SELECT
          COUNT(*) AS total_items,
          COUNT(*) FILTER (WHERE status='matched') AS matched,
          COUNT(*) FILTER (WHERE ai_triage='recycle') AS recycled,
          (SELECT revenue_ewaste FROM impact_records WHERE institution_id=1 AND recorded_month='2026-06-01') AS revenue
        FROM ewaste_listings WHERE user_id = 1
      `),
    ]);
    return NextResponse.json({ listings: listings.rows, stats: stats.rows[0] });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { item_name, category, brand, condition, ai_triage, ai_price_min, ai_price_max } = body;
  const client = await pool.connect();
  try {
    const count = await client.query('SELECT COUNT(*) FROM ewaste_listings');
    const code = `EW-${String(Number(count.rows[0].count) + 1).padStart(3, '0')}`;
    const result = await client.query(
      `INSERT INTO ewaste_listings (listing_code, user_id, item_name, category, brand, condition, ai_triage, ai_price_min, ai_price_max, status)
       VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, 'listed') RETURNING *`,
      [code, item_name, category, brand, condition, ai_triage, ai_price_min, ai_price_max]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } finally {
    client.release();
  }
}
