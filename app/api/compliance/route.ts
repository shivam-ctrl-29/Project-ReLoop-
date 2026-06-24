import { NextRequest, NextResponse } from 'next/server';
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
        SELECT
          COUNT(*) FILTER (WHERE status='valid') AS valid_count,
          COUNT(*) AS total_count,
          COUNT(*) FILTER (WHERE doc_type IN ('fssai','cpcb')) AS epr_count,
          COUNT(*) FILTER (WHERE doc_type = 'ewaste_auth') AS ewaste_count,
          COUNT(*) FILTER (WHERE doc_type = 'esg_report') AS esg_count
        FROM compliance_docs WHERE user_id = $1
      `, [userId]),
    ]);
    return NextResponse.json({ docs: docs.rows, stats: stats.rows[0] });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUserFromToken();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { doc_name, doc_type, issued_date, expires_date, quantity, buyer_name } = await req.json();
  if (!doc_name || !doc_type) return NextResponse.json({ error: 'doc_name and doc_type are required' }, { status: 400 });
  const client = await pool.connect();
  try {
    const count = await client.query('SELECT COUNT(*) FROM compliance_docs');
    const doc_code = `DOC-${authUser.id}-${String(Number(count.rows[0].count) + 1).padStart(4, '0')}`;
    const result = await client.query(
      `INSERT INTO compliance_docs (doc_code, user_id, doc_name, doc_type, issued_date, expires_date, quantity, buyer_name, status, file_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'valid','/mock-uploads/manual') RETURNING *`,
      [doc_code, authUser.id, doc_name, doc_type, issued_date || new Date(), expires_date || null, quantity || null, buyer_name || null]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } finally {
    client.release();
  }
}
