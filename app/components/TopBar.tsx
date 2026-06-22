'use client';
import { Bell, Calendar } from 'lucide-react';

export default function TopBar({ title, date }: { title: string; date?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold" style={{ color: '#1F2A24' }}>{title}</h1>
        {date && (
          <span className="text-sm px-3 py-1 rounded-full border border-gray-200 bg-white" style={{ color: '#5B6B63' }}>
            {date}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <Bell size={16} style={{ color: '#5B6B63' }} />
        </button>
        <button className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <Calendar size={16} style={{ color: '#5B6B63' }} />
        </button>
      </div>
    </div>
  );
}
