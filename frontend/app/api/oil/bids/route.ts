import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// GET — all bids placed by the logged-in buyer
export async function GET() {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        ob.id, ob.bid_price, ob.status, ob.created_at,
        ol.listing_code, ol.oil_type, ol.quantity_liters, ol.grade,
        ol.ai_price_min, ol.ai_price_max, ol.status AS listing_status,
        u.name AS seller_name
      FROM oil_bids ob
      JOIN oil_listings ol ON ol.id = ob.listing_id
      JOIN users u ON u.id = ol.user_id
      WHERE ob.buyer_id = $1
      ORDER BY ob.created_at DESC
    `, [userId]);
    return NextResponse.json(result.rows);
  } finally {
    client.release();
  }
}

// POST — place a new bid
export async function POST(req: NextRequest) {
  const authUser = await getUserFromToken();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { listing_id, bid_price } = await req.json();
  if (!listing_id || !bid_price) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const client = await pool.connect();
  try {
    // Check if buyer already bid on this listing
    const existing = await client.query(
      'SELECT id FROM oil_bids WHERE listing_id = $1 AND buyer_id = $2',
      [listing_id, authUser.id]
    );
    if (existing.rows.length > 0) {
      // Update existing bid
      const updated = await client.query(
        'UPDATE oil_bids SET bid_price = $1, status = $2 WHERE listing_id = $3 AND buyer_id = $4 RETURNING *',
        [bid_price, 'pending', listing_id, authUser.id]
      );
      return NextResponse.json(updated.rows[0]);
    }
    const result = await client.query(
      'INSERT INTO oil_bids (listing_id, buyer_id, bid_price, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [listing_id, authUser.id, bid_price, 'pending']
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } finally {
    client.release();
  }
}
