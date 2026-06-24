'use client';
import { useEffect, useState } from 'react';

export interface ReloopUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'dept_head' | 'buyer' | 'recycler';
  institution?: string;
  department?: string;
}

export function useUser(): ReloopUser | null {
  const [user, setUser] = useState<ReloopUser | null>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('reloop_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);
  return user;
}

export const ROLE_LABELS: Record<string, string> = {
  admin:     'Institution Admin',
  dept_head: 'Department Head',
  buyer:     'Verified Buyer',
  recycler:  'Recycler Partner',
};
