import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authUser = await getUserFromToken();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { listing_id } = await req.json();
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE ewaste_listings SET status = 'matched', buyer_id = $2 WHERE id = $1 AND status = 'listed'`,
      [listing_id, authUser.id]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
