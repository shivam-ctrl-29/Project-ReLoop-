import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const [listings, chart, stats] = await Promise.all([
      client.query(`
        SELECT listing_code, oil_type, quantity_liters, grade,
               ai_price_min, ai_price_max, status,
               (SELECT COUNT(*) FROM oil_bids WHERE listing_id = ol.id) AS bids
        FROM oil_listings ol WHERE user_id = 1
        ORDER BY created_at DESC
      `),
      client.query(`
        SELECT TO_CHAR(recorded_month, '"W"') || EXTRACT(MONTH FROM recorded_month)::text AS week,
               oil_collected_liters AS oil
        FROM impact_records WHERE institution_id = 1
        ORDER BY recorded_month DESC LIMIT 5
      `),
      client.query(`
        SELECT
          COUNT(*) FILTER (WHERE status='active') AS active_listings,
          (SELECT revenue_oil FROM impact_records WHERE institution_id=1 AND recorded_month='2026-06-01') AS revenue,
          (SELECT oil_collected_liters FROM impact_records WHERE institution_id=1 AND recorded_month='2026-06-01') AS diverted
        FROM oil_listings WHERE user_id = 1
      `),
    ]);
    return NextResponse.json({ listings: listings.rows, chart: chart.rows, stats: stats.rows[0] });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { oil_type, quantity_liters, grade, ai_price_min, ai_price_max } = body;
  const client = await pool.connect();
  try {
    const count = await client.query('SELECT COUNT(*) FROM oil_listings');
    const code = `OIL-${String(Number(count.rows[0].count) + 1).padStart(3, '0')}`;
    const result = await client.query(
      `INSERT INTO oil_listings (listing_code, user_id, oil_type, quantity_liters, grade, ai_price_min, ai_price_max, status)
       VALUES ($1, 1, $2, $3, $4, $5, $6, 'active') RETURNING *`,
      [code, oil_type, quantity_liters, grade, ai_price_min, ai_price_max]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } finally {
    client.release();
  }
}
