import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const role = authUser?.role ?? 'buyer';
  const client = await pool.connect();
  try {
    // dept_head sees all pickups from their institution
    if (role === 'dept_head') {
      const instRes = await client.query('SELECT institution_id FROM users WHERE id=$1', [userId]);
      const institutionId = instRes.rows[0]?.institution_id ?? 1;
      const result = await client.query(`
        SELECT p.id, p.pickup_type, p.quantity, p.scheduled_date, p.time_slot,
               p.status, p.driver_name, p.revenue, p.buyer_name,
               p.tpc_reading, p.verified_grade, p.verified_quantity, p.driver_note,
               u.name AS requester_name, u.id AS requester_id
        FROM pickups p
        JOIN users u ON u.id = p.user_id
        WHERE u.institution_id = $1
        ORDER BY p.scheduled_date DESC
      `, [institutionId]);
      return NextResponse.json({ pickups: result.rows });
    }
    const result = await client.query(`
      SELECT id, pickup_type, quantity, scheduled_date, time_slot,
             status, driver_name, revenue, buyer_name,
             tpc_reading, verified_grade, verified_quantity, driver_note
      FROM pickups WHERE user_id = $1
      ORDER BY scheduled_date DESC
    `, [userId]);
    return NextResponse.json({ pickups: result.rows });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const body = await req.json();
  const { pickup_type, quantity, scheduled_date, time_slot } = body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO pickups (user_id, pickup_type, quantity, scheduled_date, time_slot, status, location)
       VALUES ($1, $2, $3, $4, $5, 'requested', 'Symbiosis University, Indore') RETURNING *`,
      [userId, pickup_type, quantity, scheduled_date, time_slot]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } finally {
    client.release();
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const body = await req.json();
  const { id, status, tpc_reading, verified_grade, verified_quantity, driver_note, driver_name } = body;
  const client = await pool.connect();
  try {
    // Driver verification flow
    if (tpc_reading !== undefined) {
      const result = await client.query(
        `UPDATE pickups SET
          tpc_reading=$1, verified_grade=$2, verified_quantity=$3,
          driver_note=$4, status='confirmed',
          driver_name=COALESCE($5, driver_name)
         WHERE id=$6 AND user_id=$7 RETURNING *`,
        [tpc_reading, verified_grade, verified_quantity, driver_note, driver_name, id, userId]
      );
      // Update the linked oil listing grade if exists
      if (verified_grade && result.rows[0]?.listing_id) {
        await client.query(
          `UPDATE oil_listings SET grade=$1 WHERE id=$2`,
          [verified_grade, result.rows[0].listing_id]
        );
      }
      return NextResponse.json(result.rows[0]);
    }
    // Normal status update — dept_head can update any pickup in their institution
    const updateQuery = role === 'dept_head'
      ? `UPDATE pickups SET status=$1 WHERE id=$2
         AND user_id IN (SELECT id FROM users WHERE institution_id=(SELECT institution_id FROM users WHERE id=$3))
         RETURNING *`
      : `UPDATE pickups SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING *`;
    const result = await client.query(updateQuery, [status, id, userId]);
    return NextResponse.json(result.rows[0]);
  } finally {
    client.release();
  }
}
