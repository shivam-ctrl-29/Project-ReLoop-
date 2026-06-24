'use client';
import Link from 'next/link';
import { Recycle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7F5' }}>
      <div className="text-center max-w-md px-6">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ background: '#1B5E20' }}>
          <Recycle size={44} color="white" />
        </div>
        <div className="text-8xl font-black mb-2" style={{ color: '#1B5E20', fontFamily: 'Georgia, serif' }}>404</div>
        <div className="text-xl font-bold mb-3" style={{ color: '#1F2A24' }}>Page Not Found</div>
        <p className="text-sm mb-8" style={{ color: '#5B6B63' }}>
          Looks like this resource has already been recycled.<br />
          Let's get you back to the circular economy.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => history.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            style={{ color: '#5B6B63' }}>
            <ArrowLeft size={15} /> Go Back
          </button>
          <Link href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#1B5E20' }}>
            <Home size={15} /> Dashboard
          </Link>
        </div>
        <p className="text-xs mt-8" style={{ color: '#9CA3AF' }}>ReLoop · Team EcoNova · Green Tech Hackathon 2026</p>
      </div>
    </div>
  );
}
