'use client';
import { Bell, Calendar, X, CheckCircle2, Recycle, Package } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function timeAgo(date: Date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function TopBar({ title, date }: { title: string; date?: string }) {
  const router = useRouter();
  const [showNotifs, setShowNotifs]   = useState(false);
  const [notifs, setNotifs]           = useState<any[]>([]);
  const [dismissed, setDismissed]     = useState<Set<string>>(new Set());
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setNotifs(d);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const visible  = notifs.filter(n => !dismissed.has(n.id));
  const unread   = visible.filter(n => !n.read).length;
  const markRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const dismiss  = (id: string) => setDismissed(prev => new Set([...prev, id]));

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold" style={{ color: '#1F2A24', fontFamily: 'Georgia, serif' }}>{title}</h1>
        {date && (
          <span className="text-sm px-3 py-1 rounded-full border border-gray-200 bg-white" style={{ color: '#5B6B63' }}>{date}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={dropRef}>
          <button onClick={() => setShowNotifs(v => !v)}
            className="relative w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Bell size={16} style={{ color: showNotifs ? '#1B5E20' : '#5B6B63' }} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: '#DC2626' }}>
                {unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-bold" style={{ color: '#1F2A24' }}>Notifications</span>
                {unread > 0 && (
                  <button onClick={markRead} className="text-xs font-medium" style={{ color: '#1B5E20' }}>Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {visible.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">No notifications</div>
                ) : visible.map(n => {
                  const Icon = n.title.includes('Listing') ? Package : n.title.includes('Completed') ? CheckCircle2 : Recycle;
                  const color = n.title.includes('Completed') ? '#1B5E20' : n.title.includes('Listing') ? '#2196F3' : '#F59E0B';
                  const bg    = n.title.includes('Completed') ? '#F1F8F0'  : n.title.includes('Listing') ? '#E8F2FC' : '#FDF3E3';
                  return (
                    <div key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-gray-50/80' : ''}`}
                      onClick={() => { setShowNotifs(false); router.push(n.href || '/schedule'); }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: bg }}>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate" style={{ color: '#1F2A24' }}>{n.title}</span>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1B5E20' }} />}
                        </div>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#6B7280' }}>{n.message}</p>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{timeAgo(n.time)}</span>
                      </div>
                      <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} className="text-gray-300 hover:text-gray-500 mt-0.5">
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100">
                <button onClick={() => { setShowNotifs(false); router.push('/schedule'); }}
                  className="text-xs font-medium w-full text-center" style={{ color: '#1B5E20' }}>
                  View all activity
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Calendar */}
        <button onClick={() => router.push('/schedule')} title="Schedule Pickup"
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Calendar size={16} style={{ color: '#5B6B63' }} />
        </button>
      </div>
    </div>
  );
}
