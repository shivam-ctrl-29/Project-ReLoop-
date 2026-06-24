import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// GET — all pickups across institution for admin
export async function GET() {
  const authUser = await getUserFromToken();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const client = await pool.connect();
  try {
    const instRes = await client.query('SELECT institution_id FROM users WHERE id=$1', [authUser.id]);
    const institutionId = instRes.rows[0]?.institution_id ?? 1;
    const result = await client.query(`
      SELECT p.id, p.pickup_type, p.quantity, p.scheduled_date, p.time_slot,
             p.status, p.driver_name, p.revenue, p.buyer_name,
             p.tpc_reading, p.verified_grade, p.verified_quantity, p.driver_note,
             u.name AS seller_name, u.department
      FROM pickups p
      JOIN users u ON u.id = p.user_id
      WHERE u.institution_id = $1
      ORDER BY p.scheduled_date DESC
    `, [institutionId]);
    return NextResponse.json({ pickups: result.rows });
  } finally {
    client.release();
  }
}

// PATCH — admin verifies a pickup (any in institution)
export async function PATCH(req: NextRequest) {
  const authUser = await getUserFromToken();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, tpc_reading, verified_grade, verified_quantity, driver_note, driver_name } = await req.json();
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE pickups SET
        tpc_reading=$1, verified_grade=$2, verified_quantity=$3,
        driver_note=$4, status='confirmed',
        driver_name=COALESCE($5, driver_name)
      WHERE id=$6 RETURNING *
    `, [tpc_reading, verified_grade, verified_quantity, driver_note, driver_name, id]);
    if (result.rows[0]?.listing_id && verified_grade) {
      await client.query('UPDATE oil_listings SET grade=$1 WHERE id=$2', [verified_grade, result.rows[0].listing_id]);
    }
    return NextResponse.json(result.rows[0]);
  } finally {
    client.release();
  }
}
