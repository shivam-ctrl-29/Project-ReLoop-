'use client';
import { Plus, Cpu, IndianRupee, PackageCheck, Recycle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';

const items = [
  { id: 'EW-001', item: 'Dell Laptop (2019)', category: 'Laptop', condition: 'Working', triage: 'Resell', aiPrice: '₹8,000–10,000', status: 'Listed' },
  { id: 'EW-002', item: 'iPhone 11 (Cracked Screen)', category: 'Mobile', condition: 'Repairable', triage: 'Repair', aiPrice: '₹5,000–6,500', status: 'Matched' },
  { id: 'EW-003', item: 'HP Monitor 22"', category: 'Monitor', condition: 'Working', triage: 'Resell', aiPrice: '₹3,500–4,500', status: 'Listed' },
  { id: 'EW-004', item: 'Lithium Battery Pack', category: 'Battery', condition: 'Dead', triage: 'Recycle', aiPrice: '₹200–400', status: 'Pending' },
  { id: 'EW-005', item: 'USB Cables (x12)', category: 'Accessories', condition: 'Mixed', triage: 'Donate', aiPrice: '₹50–150', status: 'Listed' },
];

const weeklyData = [
  { week: 'W1', items: 8 }, { week: 'W2', items: 12 }, { week: 'W3', items: 9 },
  { week: 'W4', items: 18 }, { week: 'W5', items: 16 },
];

const statusColors: Record<string, { color: string; bg: string }> = {
  Listed:  { color: '#1B5E20', bg: '#F1F8F0' },
  Matched: { color: '#2196F3', bg: '#E8F2FC' },
  Pending: { color: '#F59E0B', bg: '#FDF3E3' },
};

const triageColors: Record<string, string> = {
  Resell: '#1B5E20', Repair: '#2196F3', Recycle: '#F59E0B', Donate: '#9333EA',
};

export default function EWastePage() {
  return (
    <div>
      <TopBar title="E-Waste Market" date="June 2026" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Items Listed" value="63" change="+7 this week" changeType="up" icon={Cpu} color="blue" />
        <StatCard label="Revenue This Month" value="₹1,24,000" change="+22%" changeType="up" icon={IndianRupee} color="amber" />
        <StatCard label="Items Matched" value="28" change="+5" changeType="up" icon={PackageCheck} color="green" />
        <StatCard label="Items Recycled" value="12" change="Stable" changeType="stable" icon={Recycle} color="blue" />
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>MY E-WASTE LISTINGS</h3>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
              <Plus size={15} /> List Item
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['ID', 'Item', 'Category', 'Condition', 'AI Triage', 'AI Value', 'Status'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const s = statusColors[item.status];
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <td className="py-3 font-semibold" style={{ color: '#1B5E20' }}>{item.id}</td>
                    <td className="py-3" style={{ color: '#1F2A24' }}>{item.item}</td>
                    <td className="py-3"><span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{item.category}</span></td>
                    <td className="py-3" style={{ color: '#5B6B63' }}>{item.condition}</td>
                    <td className="py-3">
                      <span className="text-xs font-semibold" style={{ color: triageColors[item.triage] }}>{item.triage}</span>
                    </td>
                    <td className="py-3 font-semibold" style={{ color: '#F59E0B' }}>{item.aiPrice}</td>
                    <td className="py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg }}>{item.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Triage Panel */}
        <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>AI TRIAGE GUIDE</h3>
          <div className="space-y-3">
            {[
              { label: 'Resell', desc: 'Working, good condition', color: '#1B5E20', bg: '#F1F8F0' },
              { label: 'Repair', desc: 'Repairable with minor work', color: '#2196F3', bg: '#E8F2FC' },
              { label: 'Recycle', desc: 'Non-functional components', color: '#F59E0B', bg: '#FDF3E3' },
              { label: 'Donate', desc: 'Functional but low value', color: '#9333EA', bg: '#F5F3FF' },
            ].map(({ label, desc, color, bg }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: bg }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }}></div>
                <div>
                  <div className="text-sm font-semibold" style={{ color }}>{label}</div>
                  <div className="text-xs" style={{ color: '#5B6B63' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl" style={{ background: '#F1F8F0' }}>
            <div className="text-xs font-medium mb-1" style={{ color: '#5B6B63' }}>CPCB Authorized Recyclers</div>
            <div className="text-sm font-bold" style={{ color: '#1B5E20' }}>12 verified in Indore</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>ITEMS LISTED — LAST 5 WEEKS</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v} items`, 'Listed']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Bar dataKey="items" fill="#2196F3" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
