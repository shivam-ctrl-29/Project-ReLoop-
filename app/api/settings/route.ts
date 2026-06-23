import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const authUser = await getUserFromToken();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT u.id, u.name, u.email, u.role, u.department, i.name AS institution
       FROM users u LEFT JOIN institutions i ON i.id = u.institution_id
       WHERE u.id = $1`,
      [authUser.id]
    );
    return NextResponse.json(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await getUserFromToken();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { name, department, currentPassword, newPassword } = body;
  const client = await pool.connect();
  try {
    if (newPassword) {
      const userRes = await client.query('SELECT password_hash FROM users WHERE id = $1', [authUser.id]);
      const valid = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      const hash = await bcrypt.hash(newPassword, 10);
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, authUser.id]);
    }
    if (name || department !== undefined) {
      await client.query(
        'UPDATE users SET name = COALESCE($1, name), department = COALESCE($2, department) WHERE id = $3',
        [name || null, department ?? null, authUser.id]
      );
    }
    return NextResponse.json({ ok: true });
  } finally {
    client.release();
  }
}
