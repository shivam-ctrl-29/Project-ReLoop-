import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, pickup_type, quantity, scheduled_date, time_slot,
             status, driver_name, revenue, buyer_name
      FROM pickups WHERE user_id = 1
      ORDER BY scheduled_date DESC
    `);
    return NextResponse.json(result.rows);
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pickup_type, quantity, scheduled_date, time_slot } = body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO pickups (user_id, pickup_type, quantity, scheduled_date, time_slot, status, location)
       VALUES (1, $1, $2, $3, $4, 'requested', 'Symbiosis University, Indore') RETURNING *`,
      [pickup_type, quantity, scheduled_date, time_slot]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } finally {
    client.release();
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status } = body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE pickups SET status=$1 WHERE id=$2 AND user_id=1 RETURNING *`,
      [status, id]
    );
    return NextResponse.json(result.rows[0]);
  } finally {
    client.release();
  }
}
