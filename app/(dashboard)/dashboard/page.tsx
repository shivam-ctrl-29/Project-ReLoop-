'use client';
import { useEffect, useState } from 'react';
import { Droplets, IndianRupee, Wind, ShieldCheck, Truck, FileDown, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import AlertBanner from '../../components/AlertBanner';

const statusColors: Record<string, { color: string; bg: string }> = {
  collected: { color: '#1B5E20', bg: '#F1F8F0' },
  scheduled:  { color: '#F59E0B', bg: '#FDF3E3' },
  requested:  { color: '#2196F3', bg: '#E8F2FC' },
  confirmed:  { color: '#1B5E20', bg: '#F1F8F0' },
};

const quickActions = [
  { icon: Truck,    label: 'Schedule a Pickup',   sub: "We'll collect your used oil" },
  { icon: FileDown, label: 'Download Certificate', sub: 'For FSSAI records' },
  { icon: History,  label: 'Collection History',   sub: 'All past pickups' },
];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  const s = data?.stats || {};
  const pickups = data?.pickups || [];
  const chart = data?.chart || [];

  return (
    <div>
      <TopBar title="Dashboard" date="June 2026" />
      <AlertBanner
        message="Pickup routes in Indore may be delayed Monday due to heavy rainfall"
        action="Check Schedule"
      />

      <div className="flex gap-4 mb-6">
        <StatCard label="Oil Collected This Month" value={loading ? '—' : `${Number(s.oil_kg || 0).toFixed(0)}`} unit="L" change="+12%" changeType="up" icon={Droplets} color="green" />
        <StatCard label="Earnings from Oil" value={loading ? '—' : `₹${Number(s.earnings || 0).toLocaleString('en-IN')}`} change="+8%" changeType="up" icon={IndianRupee} color="amber" />
        <StatCard label="CO2 Saved" value={loading ? '—' : `${Number(s.co2 || 0).toFixed(1)}`} unit="T" change="Stable" changeType="stable" icon={Wind} color="blue" />
        <StatCard label="Compliance Docs Ready" value={loading ? '—' : String(s.docs || 0)} change="Updated" changeType="info" icon={ShieldCheck} color="green" />
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>MY PICKUPS</h3>
            <button className="text-sm font-medium" style={{ color: '#1B5E20' }}>View All</button>
          </div>
          {loading ? (
            <div className="text-sm text-gray-400 py-4 text-center">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Date', 'Quantity', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pickups.slice(0, 3).map((p: any, i: number) => {
                  const sc = statusColors[p.status] || { color: '#5B6B63', bg: '#F5F5F5' };
                  const dateStr = new Date(p.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                  return (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-3.5" style={{ color: '#1F2A24' }}>{dateStr}</td>
                      <td className="py-3.5" style={{ color: '#1F2A24' }}>{p.quantity || '—'}</td>
                      <td className="py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: sc.color, background: sc.bg }}>{p.status}</span>
                      </td>
                      <td className="py-3.5">
                        {p.status === 'collected' && <button className="text-xs font-semibold" style={{ color: '#1B5E20' }}>Certificate</button>}
                        {p.status === 'scheduled' && <button className="text-xs font-semibold" style={{ color: '#2196F3' }}>Details</button>}
                        {p.status === 'requested' && <button className="text-xs font-semibold" style={{ color: '#DC2626' }}>Cancel</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>WHAT DO YOU WANT TO DO?</h3>
          <div className="space-y-3">
            {quickActions.map(({ icon: Icon, label, sub }, i) => (
              <button key={i} className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-left transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F8F0' }}>
                  <Icon size={16} style={{ color: '#1B5E20' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#1F2A24' }}>{label}</div>
                  <div className="text-xs" style={{ color: '#5B6B63' }}>{sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>OIL COLLECTED (LITRES) — 2026</h3>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#1B5E20' }}></div>
            <span className="text-xs" style={{ color: '#5B6B63' }}>Monthly Collection</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chart} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={(v: number) => `${v}L`} />
            <Tooltip formatter={(v: number) => [`${v} L`, 'Collected']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Bar dataKey="val" fill="#1B5E20" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
