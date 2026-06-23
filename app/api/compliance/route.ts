import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const client = await pool.connect();
  try {
    const [docs, stats] = await Promise.all([
      client.query(`
        SELECT doc_code, doc_name, issued_date, expires_date, quantity, buyer_name, status, doc_type
        FROM compliance_docs WHERE user_id = $1
        ORDER BY issued_date DESC
      `, [userId]),
      client.query(`
        SELECT COUNT(*) FILTER (WHERE status='valid') AS valid_count, COUNT(*) AS total_count
        FROM compliance_docs WHERE user_id = $1
      `, [userId]),
    ]);
    return NextResponse.json({ docs: docs.rows, stats: stats.rows[0] });
  } finally {
    client.release();
  }
}
