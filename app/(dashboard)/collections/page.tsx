'use client';
import { useEffect, useState } from 'react';
import { Archive, Droplets, Cpu, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';

export default function CollectionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/collections').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const history = data?.history || [];
  const stats = data?.stats || {};
  const chart = data?.chart || [];

  return (
    <div>
      <TopBar title="My Collections" date="June 2026" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Total Collections" value={String(stats.total || 0)} change="All time" changeType="info" icon={Archive} color="green" />
        <StatCard label="Oil Collected (Total)" value={`${Number(stats.total_oil || 0).toFixed(0)}`} unit="L" change="+12% MoM" changeType="up" icon={Droplets} color="blue" />
        <StatCard label="E-Waste Pickups" value={String(stats.total_ewaste_pickups || 0)} change="Completed" changeType="info" icon={Cpu} color="amber" />
        <StatCard label="Total Revenue" value={`₹${Number(stats.total_revenue || 0).toLocaleString('en-IN')}`} change="+22% MoM" changeType="up" icon={IndianRupee} color="green" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>COLLECTION HISTORY</h3>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" style={{ color: '#5B6B63' }}>Filter</button>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" style={{ color: '#5B6B63' }}>Export CSV</button>
          </div>
        </div>
        {loading ? <div className="text-sm text-gray-400 text-center py-6">Loading...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date', 'Type', 'Quantity', 'Revenue', 'Buyer', 'Status', 'Cert'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>
                    {new Date(h.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3">
                    <span className="flex items-center gap-1.5 text-xs capitalize">
                      {h.pickup_type === 'oil' ? <Droplets size={13} style={{ color: '#F59E0B' }} /> : <Cpu size={13} style={{ color: '#2196F3' }} />}
                      {h.pickup_type === 'oil' ? 'Used Oil' : 'E-Waste'}
                    </span>
                  </td>
                  <td className="py-3" style={{ color: '#1F2A24' }}>{h.quantity || '—'}</td>
                  <td className="py-3 font-semibold" style={{ color: '#1B5E20' }}>
                    {h.revenue ? `₹${Number(h.revenue).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{h.buyer_name || '—'}</td>
                  <td className="py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: '#1B5E20', background: '#F1F8F0' }}>{h.status}</span>
                  </td>
                  <td className="py-3">
                    <button className="text-xs font-semibold" style={{ color: '#2196F3' }}>Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>REVENUE — OIL vs E-WASTE (2026)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chart} barCategoryGap="25%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={(v: number) => `₹${v / 1000}K`} />
            <Tooltip formatter={(v: number, name: string) => [`₹${Number(v).toLocaleString('en-IN')}`, name === 'oil' ? 'Used Oil' : 'E-Waste']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Bar dataKey="oil"    fill="#F59E0B" radius={[4, 4, 0, 0]} name="oil" />
            <Bar dataKey="ewaste" fill="#1B5E20" radius={[4, 4, 0, 0]} name="ewaste" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }}></div><span className="text-xs" style={{ color: '#5B6B63' }}>Used Oil Revenue</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#1B5E20' }}></div><span className="text-xs" style={{ color: '#5B6B63' }}>E-Waste Revenue</span></div>
        </div>
      </div>
    </div>
  );
}
