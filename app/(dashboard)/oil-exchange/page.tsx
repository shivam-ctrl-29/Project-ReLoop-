'use client';
import { useEffect, useState } from 'react';
import { Plus, Droplets, IndianRupee, TrendingUp, Recycle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';

const statusColors: Record<string, { color: string; bg: string }> = {
  active:   { color: '#1B5E20', bg: '#F1F8F0' },
  matched:  { color: '#2196F3', bg: '#E8F2FC' },
  pending:  { color: '#F59E0B', bg: '#FDF3E3' },
  completed:{ color: '#5B6B63', bg: '#F5F5F5' },
};

export default function OilExchangePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ oil_type: 'Cooking Oil (Refined)', quantity_liters: '', grade: 'A' });
  const [saving, setSaving] = useState(false);

  const load = () => fetch('/api/oil').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const qty = Number(form.quantity_liters);
    const priceMap: Record<string, [number, number]> = { A: [28, 32], B: [18, 22], C: [10, 14] };
    const [min, max] = priceMap[form.grade];
    await fetch('/api/oil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity_liters: qty, ai_price_min: min, ai_price_max: max }),
    });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const listings = data?.listings || [];
  const chart = data?.chart || [];
  const stats = data?.stats || {};

  return (
    <div>
      <TopBar title="Oil Exchange" date="June 2026" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Total Listings Active" value={String(stats.active_listings || 0)} change="+2 this week" changeType="up" icon={Droplets} color="green" />
        <StatCard label="Revenue This Month" value={`₹${Number(stats.revenue || 0).toLocaleString('en-IN')}`} change="+18%" changeType="up" icon={IndianRupee} color="amber" />
        <StatCard label="Oil Diverted" value={`${Number(stats.diverted || 0).toFixed(0)}`} unit="L" change="+12%" changeType="up" icon={Recycle} color="blue" />
        <StatCard label="AI Price Accuracy" value="94" unit="%" change="Stable" changeType="stable" icon={TrendingUp} color="green" />
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>MY OIL LISTINGS</h3>
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
              <Plus size={15} /> New Listing
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-xl border border-gray-100 bg-gray-50 flex gap-3 items-end flex-wrap">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Oil Type</label>
                <select value={form.oil_type} onChange={e => setForm(f => ({ ...f, oil_type: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <option>Cooking Oil (Refined)</option><option>Palm Oil (Used)</option>
                  <option>Lubricant Oil</option><option>Mustard Oil (Used)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Quantity (L)</label>
                <input required type="number" value={form.quantity_liters} onChange={e => setForm(f => ({ ...f, quantity_liters: e.target.value }))}
                  placeholder="e.g. 100" className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-28" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Grade</label>
                <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <option value="A">Grade A</option><option value="B">Grade B</option><option value="C">Grade C</option>
                </select>
              </div>
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
                {saving ? 'Saving...' : 'Add Listing'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
            </form>
          )}

          {loading ? <div className="text-sm text-gray-400 py-4 text-center">Loading...</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['ID', 'Type', 'Quantity', 'Grade', 'AI Price', 'Bids', 'Status'].map(h => (
                    <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l: any, i: number) => {
                  const s = statusColors[l.status] || { color: '#5B6B63', bg: '#F5F5F5' };
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                      <td className="py-3 font-semibold" style={{ color: '#1B5E20' }}>{l.listing_code}</td>
                      <td className="py-3" style={{ color: '#1F2A24' }}>{l.oil_type}</td>
                      <td className="py-3">{l.quantity_liters} L</td>
                      <td className="py-3"><span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">Grade {l.grade}</span></td>
                      <td className="py-3 font-semibold" style={{ color: '#F59E0B' }}>₹{l.ai_price_min}–{l.ai_price_max}/L</td>
                      <td className="py-3 font-semibold text-center">{l.bids}</td>
                      <td className="py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: s.color, background: s.bg }}>{l.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>AI PRICE ESTIMATOR</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Oil Type</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                <option>Cooking Oil (Refined)</option><option>Palm Oil</option>
                <option>Lubricant Oil</option><option>Mustard Oil</option>
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
            <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>Get AI Price</button>
            <div className="rounded-xl p-3 text-center" style={{ background: '#F1F8F0' }}>
              <div className="text-xs mb-1" style={{ color: '#5B6B63' }}>Suggested Range</div>
              <div className="text-xl font-bold" style={{ color: '#1B5E20', fontFamily: 'Georgia, serif' }}>₹28 – ₹32/L</div>
              <div className="text-xs mt-1" style={{ color: '#5B6B63' }}>Based on market demand · Jun 2026</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>OIL DIVERTED — LAST 6 MONTHS</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chart} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={(v: number) => `${v}L`} />
            <Tooltip formatter={(v: number) => [`${v} L`, 'Oil']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Bar dataKey="oil" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
