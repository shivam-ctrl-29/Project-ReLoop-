'use client';
import { Recycle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7F5' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#1B5E20' }}>
            <Recycle size={26} color="white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#1B5E20' }}>ReLoop</h1>
          <p className="text-sm mt-1" style={{ color: '#5B6B63' }}>Circular Resource Management Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#1F2A24' }}>Sign in to your account</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Institution Email</label>
              <input type="email" placeholder="you@symbiosis.edu.in" defaultValue="suraj@symbiosis.edu.in"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-700" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Password</label>
              <input type="password" defaultValue="password" placeholder="••••••••"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-700" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs" style={{ color: '#5B6B63' }}>
                <input type="checkbox" className="accent-green-700" defaultChecked /> Remember me
              </label>
              <button className="text-xs font-medium" style={{ color: '#1B5E20' }}>Forgot password?</button>
            </div>
            <Link href="/dashboard">
              <button className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-2" style={{ background: '#1B5E20' }}>
                Sign In
              </button>
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-center mb-4" style={{ color: '#5B6B63' }}>Sign in as</p>
            <div className="grid grid-cols-3 gap-2">
              {['Institution Admin', 'Department Head', 'Verified Buyer'].map(role => (
                <Link key={role} href="/dashboard">
                  <button className="w-full py-2 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-50" style={{ color: '#5B6B63' }}>
                    {role}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-center mt-5" style={{ color: '#5B6B63' }}>
          Team EcoNova · Symbiosis University of Applied Sciences, Indore
        </p>
      </div>
    </div>
  );
}
