import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  try {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const client = await pool.connect();
  try {
    const [pickups, listings] = await Promise.all([
      client.query(`
        SELECT id, pickup_type, status, scheduled_date, created_at
        FROM pickups WHERE user_id = $1
        ORDER BY created_at DESC LIMIT 3
      `, [userId]),
      client.query(`
        SELECT id, 'oil' AS type, listing_code AS code, status, created_at FROM oil_listings WHERE user_id = $1
        UNION ALL
        SELECT id, 'ewaste' AS type, listing_code AS code, status, created_at FROM ewaste_listings WHERE user_id = $1
        ORDER BY created_at DESC LIMIT 2
      `, [userId]),
    ]);

    const notifications = [
      ...pickups.rows.map(p => ({
        id: `pickup-${p.id}`,
        title: p.status === 'collected' ? 'Pickup Completed' : p.status === 'confirmed' ? 'Pickup Confirmed' : 'Pickup Scheduled',
        message: `${p.pickup_type === 'oil' ? 'Oil' : 'E-Waste'} pickup on ${new Date(p.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
        time: new Date(p.created_at),
        read: p.status === 'collected',
        href: '/schedule',
      })),
      ...listings.rows.map(l => ({
        id: `listing-${l.type}-${l.id}`,
        title: 'New Listing Created',
        message: `${l.code} is ${l.status}`,
        time: new Date(l.created_at),
        read: l.status !== 'active' && l.status !== 'listed',
        href: l.type === 'oil' ? '/oil-exchange' : '/ewaste',
      })),
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

    return NextResponse.json(notifications);
  } finally {
    client.release();
  }
  } catch {
    return NextResponse.json([]);
  }
}
