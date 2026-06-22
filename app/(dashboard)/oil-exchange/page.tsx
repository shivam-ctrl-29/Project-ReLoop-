'use client';
import { Plus, Droplets, IndianRupee, TrendingUp, Recycle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';

const listings = [
  { id: 'OIL-001', type: 'Cooking Oil (Refined)', qty: '120 L', grade: 'Grade A', aiPrice: '₹28–32/L', status: 'Active', bids: 3 },
  { id: 'OIL-002', type: 'Palm Oil (Used)',        qty: '80 L',  grade: 'Grade B', aiPrice: '₹18–22/L', status: 'Matched', bids: 1 },
  { id: 'OIL-003', type: 'Lubricant Oil',          qty: '45 L',  grade: 'Grade C', aiPrice: '₹10–14/L', status: 'Pending', bids: 0 },
  { id: 'OIL-004', type: 'Mustard Oil (Used)',     qty: '200 L', grade: 'Grade A', aiPrice: '₹30–35/L', status: 'Active', bids: 5 },
];

const weeklyData = [
  { week: 'W1', oil: 180 }, { week: 'W2', oil: 220 }, { week: 'W3', oil: 195 },
  { week: 'W4', oil: 260 }, { week: 'W5', oil: 340 },
];

const statusColors: Record<string, { color: string; bg: string }> = {
  Active:  { color: '#1B5E20', bg: '#F1F8F0' },
  Matched: { color: '#2196F3', bg: '#E8F2FC' },
  Pending: { color: '#F59E0B', bg: '#FDF3E3' },
};

export default function OilExchangePage() {
  return (
    <div>
      <TopBar title="Oil Exchange" date="June 2026" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Total Listings Active" value="4" change="+2 this week" changeType="up" icon={Droplets} color="green" />
        <StatCard label="Revenue This Month" value="₹42,800" change="+18%" changeType="up" icon={IndianRupee} color="amber" />
        <StatCard label="Oil Diverted" value="180" unit="L" change="+12%" changeType="up" icon={Recycle} color="blue" />
        <StatCard label="AI Price Accuracy" value="94" unit="%" change="Stable" changeType="stable" icon={TrendingUp} color="green" />
      </div>

      <div className="flex gap-5 mb-6">
        {/* Listings */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>MY OIL LISTINGS</h3>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#1B5E20' }}>
              <Plus size={15} /> New Listing
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['ID', 'Type', 'Quantity', 'Grade', 'AI Price', 'Bids', 'Status'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => {
                const s = statusColors[l.status];
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <td className="py-3" style={{ color: '#1B5E20', fontWeight: 600 }}>{l.id}</td>
                    <td className="py-3" style={{ color: '#1F2A24' }}>{l.type}</td>
                    <td className="py-3" style={{ color: '#1F2A24' }}>{l.qty}</td>
                    <td className="py-3"><span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{l.grade}</span></td>
                    <td className="py-3 font-semibold" style={{ color: '#F59E0B' }}>{l.aiPrice}</td>
                    <td className="py-3 font-semibold text-center" style={{ color: '#1F2A24' }}>{l.bids}</td>
                    <td className="py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg }}>{l.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Price Panel */}
        <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>AI PRICE ESTIMATOR</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Oil Type</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                <option>Cooking Oil (Refined)</option>
                <option>Palm Oil</option>
                <option>Lubricant Oil</option>
                <option>Mustard Oil</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Volume (Litres)</label>
              <input type="number" defaultValue={100} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Grade</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                <option>Grade A</option><option>Grade B</option><option>Grade C</option>
              </select>
            </div>
            <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
              Get AI Price
            </button>
            <div className="rounded-xl p-3 text-center" style={{ background: '#F1F8F0' }}>
              <div className="text-xs mb-1" style={{ color: '#5B6B63' }}>Suggested Range</div>
              <div className="text-xl font-bold" style={{ color: '#1B5E20', fontFamily: 'Georgia, serif' }}>₹28 – ₹32/L</div>
              <div className="text-xs mt-1" style={{ color: '#5B6B63' }}>Based on market demand · Jun 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>OIL DIVERTED — LAST 5 WEEKS</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={v => `${v}L`} />
            <Tooltip formatter={(v: number) => [`${v} L`, 'Oil']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Bar dataKey="oil" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
