'use client';
import { useEffect, useState } from 'react';
import { Trophy, Medal, Star, Droplets, Cpu, Recycle, Loader2 } from 'lucide-react';
import TopBar from '../../components/TopBar';

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  admin:     { label: 'Admin',      color: '#1B5E20', bg: '#F1F8F0' },
  dept_head: { label: 'Dept Head',  color: '#2196F3', bg: '#E8F2FC' },
  buyer:     { label: 'Buyer',      color: '#F59E0B', bg: '#FDF3E3' },
  recycler:  { label: 'Recycler',   color: '#7C3AED', bg: '#F3F0FF' },
};

const RANK_ICON = [
  <Trophy key={1} size={20} style={{ color: '#F59E0B' }} />,
  <Medal  key={2} size={20} style={{ color: '#9CA3AF' }} />,
  <Star   key={3} size={20} style={{ color: '#CD7C2F' }} />,
];

export default function LeaderboardPage() {
  const [users, setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(d => { setUsers(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const topThree = users.slice(0, 3);
  const rest     = users.slice(3);

  return (
    <div>
      <TopBar title="Leaderboard" date="June 2026" />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading leaderboard...
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="flex items-end justify-center gap-4 mb-8 mt-2">
            {[topThree[1], topThree[0], topThree[2]].map((u, podiumIdx) => {
              if (!u) return <div key={podiumIdx} className="w-52" />;
              const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
              const heights = [' h-36', 'h-44', 'h-32'];
              const meta = ROLE_META[u.role] || ROLE_META.admin;
              return (
                <div key={u.id} className={`flex flex-col items-center w-52`}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold mb-2 shadow-md"
                    style={{ background: meta.color }}>
                    {u.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div className="font-bold text-sm mb-0.5 text-center" style={{ color: '#1F2A24' }}>{u.name}</div>
                  <div className="text-xs mb-2 text-center" style={{ color: '#5B6B63' }}>{u.department || meta.label}</div>
                  <div className={`w-full ${heights[podiumIdx]} rounded-t-2xl flex flex-col items-center justify-end pb-4 shadow-sm`}
                    style={{ background: rank === 1 ? '#FEF3C7' : rank === 2 ? '#F5F7F5' : '#FDF0E6' }}>
                    <div className="mb-2">{RANK_ICON[rank - 1]}</div>
                    <div className="text-2xl font-bold" style={{ color: '#1F2A24' }}>#{rank}</div>
                    <div className="text-xs font-semibold mt-1" style={{ color: '#5B6B63' }}>
                      {u.pickups} pickups
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>ALL CONTRIBUTORS</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Rank','User','Role','Pickups','Oil (L)','E-Waste','Revenue (₹)'].map(h => (
                    <th key={h} className="text-left pb-3 font-medium text-xs" style={{ color: '#5B6B63' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any, i: number) => {
                  const meta = ROLE_META[u.role] || ROLE_META.admin;
                  return (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 w-12">
                        {i < 3
                          ? <div className="w-7 h-7 flex items-center justify-center">{RANK_ICON[i]}</div>
                          : <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: '#F5F7F5', color: '#5B6B63' }}>#{i+1}</div>
                        }
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: meta.color }}>
                            {u.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: '#1F2A24' }}>{u.name}</div>
                            <div className="text-xs" style={{ color: '#9CA3AF' }}>{u.department || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: meta.color, background: meta.bg }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5 font-semibold" style={{ color: '#1B5E20' }}>
                          <Recycle size={13} /> {u.pickups}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5" style={{ color: '#F59E0B' }}>
                          <Droplets size={13} /> {Number(u.oil_liters).toFixed(0)}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5" style={{ color: '#2196F3' }}>
                          <Cpu size={13} /> {u.ewaste_items}
                        </div>
                      </td>
                      <td className="py-3 font-semibold" style={{ color: '#1B5E20' }}>
                        ₹{Number(u.revenue).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
