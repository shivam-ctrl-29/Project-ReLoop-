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

    const [listings, chart, stats] = await Promise.all([
      // Buyers see all active listings from all sellers; sellers see only their own
      isBuyer
        ? client.query(`
            SELECT ol.id, ol.listing_code, ol.oil_type, ol.quantity_liters, ol.grade,
                   ol.ai_price_min, ol.ai_price_max, ol.status,
                   u.name AS seller_name,
                   (SELECT COUNT(*) FROM oil_bids WHERE listing_id = ol.id) AS bids,
                   (SELECT bid_price FROM oil_bids WHERE listing_id = ol.id AND buyer_id = $1 LIMIT 1) AS my_bid
            FROM oil_listings ol
            JOIN users u ON u.id = ol.user_id
            WHERE ol.status IN ('active','matched')
            ORDER BY ol.created_at DESC
          `, [userId])
        : client.query(`
            SELECT listing_code, oil_type, quantity_liters, grade,
                   ai_price_min, ai_price_max, status,
                   (SELECT COUNT(*) FROM oil_bids WHERE listing_id = ol.id) AS bids
            FROM oil_listings ol WHERE user_id = $1
            ORDER BY created_at DESC
          `, [userId]),
      client.query(`
        SELECT TO_CHAR(recorded_month, '"W"') || EXTRACT(MONTH FROM recorded_month)::text AS week,
               oil_collected_liters AS oil
        FROM impact_records WHERE institution_id = $1
        ORDER BY recorded_month DESC LIMIT 6
      `, [institutionId]),
      client.query(`
        SELECT
          COUNT(*) FILTER (WHERE status='active') AS active_listings,
          (SELECT revenue_oil FROM impact_records WHERE institution_id=$1 ORDER BY recorded_month DESC LIMIT 1) AS revenue,
          (SELECT oil_collected_liters FROM impact_records WHERE institution_id=$1 ORDER BY recorded_month DESC LIMIT 1) AS diverted
        FROM oil_listings WHERE ${isBuyer ? 'status IN (\'active\',\'matched\')' : `user_id = ${userId}`}
      `, [institutionId]),
    ]);
    return NextResponse.json({ listings: listings.rows, chart: chart.rows, stats: stats.rows[0] });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const body = await req.json();
  const { oil_type, quantity_liters, grade, ai_price_min, ai_price_max } = body;
  const client = await pool.connect();
  try {
    const count = await client.query('SELECT COUNT(*) FROM oil_listings');
    const code = `OIL-${String(Number(count.rows[0].count) + 1).padStart(3, '0')}`;
    const result = await client.query(
      `INSERT INTO oil_listings (listing_code, user_id, oil_type, quantity_liters, grade, ai_price_min, ai_price_max, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *`,
      [code, userId, oil_type, quantity_liters, grade, ai_price_min, ai_price_max]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } finally {
    client.release();
  }
}
