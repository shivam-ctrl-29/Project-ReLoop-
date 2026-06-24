import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const client = await pool.connect();
  try {
    const instRes = await client.query('SELECT institution_id FROM users WHERE id=$1', [userId]);
    const institutionId = instRes.rows[0]?.institution_id ?? 1;

    const [oilBids, ewasteOrders, pickups] = await Promise.all([
      client.query(`
        SELECT
          ob.id,
          TO_CHAR(ob.created_at, 'YYYY-MM-DD') AS date,
          'Oil Bid' AS type,
          ol.listing_code AS reference,
          ol.oil_type AS description,
          ob.bid_price || '/L × ' || ol.quantity_liters || 'L' AS qty,
          ROUND(ob.bid_price * ol.quantity_liters) AS amount,
          ob.status,
          u_buyer.name AS counterparty
        FROM oil_bids ob
        JOIN oil_listings ol ON ol.id = ob.listing_id
        JOIN users u_buyer ON u_buyer.id = ob.buyer_id
        JOIN users u_seller ON u_seller.id = ol.user_id
        WHERE u_seller.institution_id = $1 OR u_buyer.institution_id = $1
        ORDER BY ob.created_at DESC
      `, [institutionId]),
      client.query(`
        SELECT
          eo.id,
          TO_CHAR(eo.created_at, 'YYYY-MM-DD') AS date,
          'E-Waste Order' AS type,
          el.listing_code AS reference,
          el.item_name AS description,
          '1 unit' AS qty,
          ROUND((el.ai_price_min + el.ai_price_max) / 2) AS amount,
          'confirmed' AS status,
          u_seller.name AS counterparty
        FROM ewaste_orders eo
        JOIN ewaste_listings el ON el.id = eo.listing_id
        JOIN users u_seller ON u_seller.id = el.user_id
        JOIN users u_buyer ON u_buyer.id = eo.buyer_id
        WHERE u_seller.institution_id = $1 OR u_buyer.institution_id = $1
        ORDER BY eo.created_at DESC
      `, [institutionId]),
      client.query(`
        SELECT
          p.id,
          TO_CHAR(p.scheduled_date, 'YYYY-MM-DD') AS date,
          'Pickup' AS type,
          '#' || p.id AS reference,
          INITCAP(p.pickup_type) || ' pickup — ' || COALESCE(p.quantity,'TBD') AS description,
          COALESCE(p.quantity, '—') AS qty,
          COALESCE(p.revenue, 0) AS amount,
          p.status,
          COALESCE(p.driver_name, 'Pending') AS counterparty
        FROM pickups p
        JOIN users u ON u.id = p.user_id
        WHERE u.institution_id = $1
        ORDER BY p.scheduled_date DESC
      `, [institutionId]),
    ]);

    const rows = [
      ...oilBids.rows.map(r => ({ ...r, category: 'Oil Exchange' })),
      ...ewasteOrders.rows.map(r => ({ ...r, category: 'E-Waste Market' })),
      ...pickups.rows.map(r => ({ ...r, category: 'Pickup' })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({ transactions: rows });
  } finally {
    client.release();
  }
}
