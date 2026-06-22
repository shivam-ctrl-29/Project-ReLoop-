'use client';
import { useEffect, useState } from 'react';
import { Plus, Cpu, IndianRupee, PackageCheck, Recycle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';

const statusColors: Record<string, { color: string; bg: string }> = {
  listed:   { color: '#1B5E20', bg: '#F1F8F0' },
  matched:  { color: '#2196F3', bg: '#E8F2FC' },
  pending:  { color: '#F59E0B', bg: '#FDF3E3' },
  completed:{ color: '#5B6B63', bg: '#F5F5F5' },
};
const triageColors: Record<string, string> = {
  resell: '#1B5E20', repair: '#2196F3', recycle: '#F59E0B', donate: '#9333EA',
};

export default function EWastePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ item_name: '', category: 'laptop', brand: '', condition: 'working', ai_triage: 'resell', ai_price_min: '', ai_price_max: '' });
  const [saving, setSaving] = useState(false);

  const load = () => fetch('/api/ewaste').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/ewaste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ai_price_min: Number(form.ai_price_min), ai_price_max: Number(form.ai_price_max) }),
    });
    setSaving(false); setShowForm(false); load();
  };

  const listings = data?.listings || [];
  const stats = data?.stats || {};

  return (
    <div>
      <TopBar title="E-Waste Market" date="June 2026" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Items Listed" value={String(stats.total_items || 0)} change="+7 this week" changeType="up" icon={Cpu} color="blue" />
        <StatCard label="Revenue This Month" value={`₹${Number(stats.revenue || 0).toLocaleString('en-IN')}`} change="+22%" changeType="up" icon={IndianRupee} color="amber" />
        <StatCard label="Items Matched" value={String(stats.matched || 0)} change="+5" changeType="up" icon={PackageCheck} color="green" />
        <StatCard label="Items Recycled" value={String(stats.recycled || 0)} change="Stable" changeType="stable" icon={Recycle} color="blue" />
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>MY E-WASTE LISTINGS</h3>
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
              <Plus size={15} /> List Item
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-xl border border-gray-100 bg-gray-50 grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Item Name</label>
                <input required value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))}
                  placeholder="e.g. Dell Laptop 2019" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <option value="laptop">Laptop</option><option value="mobile">Mobile</option>
                  <option value="monitor">Monitor</option><option value="battery">Battery</option>
                  <option value="accessories">Accessories</option><option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Brand</label>
                <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="e.g. Dell" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Condition</label>
                <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <option value="working">Working</option><option value="repairable">Repairable</option>
                  <option value="dead">Dead</option><option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>AI Triage</label>
                <select value={form.ai_triage} onChange={e => setForm(f => ({ ...f, ai_triage: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <option value="resell">Resell</option><option value="repair">Repair</option>
                  <option value="recycle">Recycle</option><option value="donate">Donate</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Min Price (₹)</label>
                <input type="number" value={form.ai_price_min} onChange={e => setForm(f => ({ ...f, ai_price_min: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Max Price (₹)</label>
                <input type="number" value={form.ai_price_max} onChange={e => setForm(f => ({ ...f, ai_price_max: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
              </div>
              <div className="col-span-3 flex gap-2">
                <button type="submit" disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
                  {saving ? 'Saving...' : 'Add Item'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
              </div>
            </form>
          )}

          {loading ? <div className="text-sm text-gray-400 py-4 text-center">Loading...</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['ID', 'Item', 'Category', 'Condition', 'AI Triage', 'AI Value', 'Status'].map(h => (
                    <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((item: any, i: number) => {
                  const s = statusColors[item.status] || { color: '#5B6B63', bg: '#F5F5F5' };
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-semibold" style={{ color: '#1B5E20' }}>{item.listing_code}</td>
                      <td className="py-3" style={{ color: '#1F2A24' }}>{item.item_name}</td>
                      <td className="py-3"><span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{item.category}</span></td>
                      <td className="py-3 capitalize" style={{ color: '#5B6B63' }}>{item.condition}</td>
                      <td className="py-3">
                        <span className="text-xs font-semibold capitalize" style={{ color: triageColors[item.ai_triage] || '#5B6B63' }}>{item.ai_triage}</span>
                      </td>
                      <td className="py-3 font-semibold" style={{ color: '#F59E0B' }}>₹{Number(item.ai_price_min).toLocaleString('en-IN')}–{Number(item.ai_price_max).toLocaleString('en-IN')}</td>
                      <td className="py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: s.color, background: s.bg }}>{item.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>AI TRIAGE GUIDE</h3>
          <div className="space-y-3">
            {[
              { label: 'Resell',  desc: 'Working, good condition',   color: '#1B5E20', bg: '#F1F8F0' },
              { label: 'Repair',  desc: 'Repairable with minor work', color: '#2196F3', bg: '#E8F2FC' },
              { label: 'Recycle', desc: 'Non-functional components',  color: '#F59E0B', bg: '#FDF3E3' },
              { label: 'Donate',  desc: 'Functional but low value',   color: '#9333EA', bg: '#F5F3FF' },
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
    </div>
  );
}
