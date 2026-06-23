import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface JWTUser {
  id: number;
  email: string;
  role: string;
  name: string;
}

export async function getUserFromToken(): Promise<JWTUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('reloop_token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTUser;
    return decoded;
  } catch {
    return null;
  }
}
