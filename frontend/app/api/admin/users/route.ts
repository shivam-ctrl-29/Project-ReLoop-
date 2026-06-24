import { NextResponse } from 'next/server';
import pool from '@/lib/db';
const query = (text: string, params?: any[]) => pool.query(text, params);

export async function GET() {
  try {
    const users = await query(`
      SELECT
        u.id, u.name, u.email, u.role, u.department, u.created_at,
        i.name AS institution,
        COALESCE(p.pickup_count, 0)    AS pickup_count,
        COALESCE(p.collected, 0)       AS collected_count,
        COALESCE(ol.oil_listings, 0)   AS oil_listings,
        COALESCE(ew.ewaste_listings, 0) AS ewaste_listings,
        COALESCE(ob.bids, 0)           AS bids_placed
      FROM users u
      LEFT JOIN institutions i ON u.institution_id = i.id
      LEFT JOIN (
        SELECT user_id,
               COUNT(*) AS pickup_count,
               SUM(CASE WHEN status = 'collected' THEN 1 ELSE 0 END) AS collected
        FROM pickups GROUP BY user_id
      ) p ON p.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS oil_listings FROM oil_listings GROUP BY user_id
      ) ol ON ol.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS ewaste_listings FROM ewaste_listings GROUP BY user_id
      ) ew ON ew.user_id = u.id
      LEFT JOIN (
        SELECT buyer_id, COUNT(*) AS bids FROM oil_bids GROUP BY buyer_id
      ) ob ON ob.buyer_id = u.id
      ORDER BY u.created_at DESC
    `);

    const stats = await query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN role = 'admin'     THEN 1 ELSE 0 END) AS admins,
        SUM(CASE WHEN role = 'dept_head' THEN 1 ELSE 0 END) AS dept_heads,
        SUM(CASE WHEN role = 'buyer'     THEN 1 ELSE 0 END) AS buyers,
        SUM(CASE WHEN role = 'recycler'  THEN 1 ELSE 0 END) AS recyclers
      FROM users
    `);

    return NextResponse.json({ users: users.rows, stats: stats.rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ users: [], stats: {} }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, role } = await req.json();
    const valid = ['admin', 'dept_head', 'buyer', 'recycler'];
    if (!valid.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await query('DELETE FROM users WHERE id = $1', [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
