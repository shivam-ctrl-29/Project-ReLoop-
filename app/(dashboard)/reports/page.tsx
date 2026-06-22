'use client';
import { useEffect, useState } from 'react';
import { BarChart2, Leaf, Recycle, Droplets, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';

const sdgData = [
  { sdg: 'SDG 6', score: 82 }, { sdg: 'SDG 11', score: 74 },
  { sdg: 'SDG 12', score: 91 }, { sdg: 'SDG 13', score: 78 },
  { sdg: 'SDG 17', score: 65 },
];

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const monthly = data?.monthly || [];
  const totals = data?.totals || {};
  const depts = data?.depts || [];

  const maxRevenue = Math.max(...depts.map((d: any) => Number(d.oil) * 30 + Number(d.ewaste) * 5000), 1);

  return (
    <div>
      <TopBar title="Reports & Impact" date="June 2026" />

      <div className="flex gap-4 mb-6">
        <StatCard label="CO2 Saved (YTD)" value={`${Number(totals.total_co2 || 0).toFixed(1)}`} unit="T" change="+2.4T MoM" changeType="up" icon={Leaf} color="green" />
        <StatCard label="Water Conserved (YTD)" value={`${(Number(totals.total_water || 0) / 1000).toFixed(1)}`} unit="K L" change="+9.2K MoM" changeType="up" icon={Droplets} color="blue" />
        <StatCard label="Total Revenue (YTD)" value={`₹${Number(totals.total_revenue || 0).toLocaleString('en-IN')}`} change="+22% vs target" changeType="up" icon={BarChart2} color="amber" />
        <StatCard label="Items Diverted" value={`${Number(totals.total_items || 0).toFixed(0)}`} change="All time" changeType="info" icon={Recycle} color="green" />
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>REVENUE — 2026</h3>
          {loading ? <div className="text-sm text-gray-400 text-center py-10">Loading...</div> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={(v: number) => `₹${v / 1000}K`} />
                <Tooltip formatter={(v: number) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="revenue" fill="#1B5E20" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>SDG ALIGNMENT SCORES</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={sdgData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="sdg" tick={{ fill: '#5B6B63', fontSize: 11 }} />
              <Radar dataKey="score" stroke="#1B5E20" fill="#1B5E20" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>TOP DIVERTING DEPARTMENTS</h3>
          {loading ? <div className="text-sm text-gray-400 text-center py-6">Loading...</div> : (
            <div className="space-y-4">
              {depts.map((d: any, i: number) => {
                const total = Number(d.oil) * 30 + Number(d.ewaste) * 5000;
                const pct = Math.round((total / maxRevenue) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: '#1F2A24' }}>{d.department || 'Unknown'}</span>
                      <span className="text-xs" style={{ color: '#5B6B63' }}>{Number(d.oil).toFixed(0)}L oil · {d.ewaste} items</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#1B5E20' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>EXPORT REPORTS</h3>
          <div className="space-y-3">
            {[
              { label: 'Monthly Impact Report',  desc: 'Oil, E-Waste & Water summary',  format: 'PDF' },
              { label: 'CSR/ESG Report (Q2)',     desc: 'SDG-mapped compliance export',  format: 'PDF' },
              { label: 'Transaction Ledger',      desc: 'All pickups & revenues',        format: 'CSV' },
              { label: 'NAAC Green Campus Data',  desc: 'Formatted for NAAC submission', format: 'XLSX' },
            ].map(({ label, desc, format }) => (
              <button key={label} className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-left">
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#1F2A24' }}>{label}</div>
                  <div className="text-xs" style={{ color: '#5B6B63' }}>{desc}</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#2196F3' }}>
                  <Download size={13} /> {format}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
