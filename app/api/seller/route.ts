import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// GET — all bids received on seller's listings
export async function GET() {
  const authUser = await getUserFromToken();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = authUser.id;
  const client = await pool.connect();
  try {
    const [oilBids, ewaste, oilListings, stats] = await Promise.all([
      client.query(`
        SELECT
          ob.id AS bid_id, ob.bid_price, ob.status AS bid_status, ob.created_at,
          ol.id AS listing_id, ol.listing_code, ol.oil_type, ol.quantity_liters, ol.grade,
          ol.ai_price_min, ol.ai_price_max, ol.status AS listing_status,
          u.name AS buyer_name, u.email AS buyer_email,
          EXISTS(SELECT 1 FROM compliance_docs cd WHERE cd.user_id = u.id AND cd.status = 'valid') AS buyer_verified
        FROM oil_bids ob
        JOIN oil_listings ol ON ol.id = ob.listing_id
        JOIN users u ON u.id = ob.buyer_id
        WHERE ol.user_id = $1
        ORDER BY ob.created_at DESC
      `, [userId]),
      client.query(`
        SELECT listing_code, item_name, category, brand, condition,
               ai_triage, ai_price_min, ai_price_max, status, created_at
        FROM ewaste_listings WHERE user_id = $1
        ORDER BY created_at DESC
      `, [userId]),
      client.query(`
        SELECT listing_code, oil_type, quantity_liters, grade,
               ai_price_min, ai_price_max, status, created_at,
               (SELECT COUNT(*) FROM oil_bids WHERE listing_id = ol.id) AS bid_count
        FROM oil_listings ol WHERE user_id = $1
        ORDER BY created_at DESC
      `, [userId]),
      client.query(`
        SELECT
          (SELECT COUNT(*) FROM oil_listings WHERE user_id=$1 AND status='active') AS active_oil,
          (SELECT COUNT(*) FROM ewaste_listings WHERE user_id=$1 AND status='listed') AS active_ewaste,
          (SELECT COUNT(*) FROM oil_bids ob JOIN oil_listings ol ON ol.id=ob.listing_id WHERE ol.user_id=$1 AND ob.status='pending') AS pending_bids,
          (SELECT COUNT(*) FROM oil_bids ob JOIN oil_listings ol ON ol.id=ob.listing_id WHERE ol.user_id=$1 AND ob.status='accepted') AS accepted_bids
      `, [userId]),
    ]);
    return NextResponse.json({
      oilBids: oilBids.rows,
      ewasteListings: ewaste.rows,
      oilListings: oilListings.rows,
      stats: stats.rows[0],
    });
  } finally {
    client.release();
  }
}

// PATCH — accept or reject a bid
export async function PATCH(req: NextRequest) {
  const authUser = await getUserFromToken();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bid_id, action } = await req.json();
  if (!bid_id || !['accept','reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const client = await pool.connect();
  try {
    // Verify this bid belongs to seller's listing
    const check = await client.query(
      `SELECT ob.id FROM oil_bids ob JOIN oil_listings ol ON ol.id = ob.listing_id WHERE ob.id = $1 AND ol.user_id = $2`,
      [bid_id, authUser.id]
    );
    if (check.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await client.query('UPDATE oil_bids SET status=$1 WHERE id=$2', [newStatus, bid_id]);
    if (action === 'accept') {
      // Mark listing as matched when a bid is accepted
      await client.query(
        `UPDATE oil_listings SET status='matched' WHERE id = (SELECT listing_id FROM oil_bids WHERE id=$1)`,
        [bid_id]
      );
    }
    return NextResponse.json({ success: true, status: newStatus });
  } finally {
    client.release();
  }
}
