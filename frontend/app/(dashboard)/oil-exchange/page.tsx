'use client';
import { useEffect, useState } from 'react';
import { Plus, Droplets, IndianRupee, TrendingUp, Recycle, Sparkles, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import { useUser } from '@/lib/useUser';

const statusColors: Record<string, { color: string; bg: string }> = {
  active:    { color: '#1B5E20', bg: '#F1F8F0' },
  matched:   { color: '#2196F3', bg: '#E8F2FC' },
  pending:   { color: '#F59E0B', bg: '#FDF3E3' },
  completed: { color: '#5B6B63', bg: '#F5F5F5' },
};

const AI_BASE: Record<string, number> = {
  'Cooking Oil (Refined)': 30, 'Palm Oil (Used)': 22,
  'Lubricant Oil': 18, 'Mustard Oil (Used)': 28,
};
const GRADE_MULT: Record<string, number> = { A: 1.0, B: 0.7, C: 0.45 };

function calcAIPrice(oilType: string, grade: string, volume: number) {
  const base = AI_BASE[oilType] ?? 25;
  const mult = GRADE_MULT[grade] ?? 1;
  const vol  = Math.max(volume, 1);
  const volFactor = vol > 500 ? 1.08 : vol > 100 ? 1.04 : 1.0;
  return { min: Math.round(base * mult * volFactor * 0.9), max: Math.round(base * mult * volFactor * 1.1) };
}

export default function OilExchangePage() {
  const user = useUser();
  const canList = user?.role === 'admin' || user?.role === 'dept_head';
  const isBuyer = user?.role === 'buyer';

  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ oil_type: 'Cooking Oil (Refined)', quantity_liters: '', grade: 'A' });
  const [saving, setSaving]     = useState(false);

  // Bid modal state
  const [bidListing, setBidListing] = useState<any>(null);
  const [bidPrice, setBidPrice]     = useState('');
  const [bidding, setBidding]       = useState(false);
  const [bidDone, setBidDone]       = useState<string | null>(null);

  // AI estimator
  const [estType,   setEstType]   = useState('Cooking Oil (Refined)');
  const [estVol,    setEstVol]    = useState(100);
  const [estGrade,  setEstGrade]  = useState('A');
  const [aiResult,  setAiResult]  = useState<{ min: number; max: number } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = () => fetch('/api/oil').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const qty = Number(form.quantity_liters);
    const { min, max } = calcAIPrice(form.oil_type, form.grade, qty);
    await fetch('/api/oil', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity_liters: qty, ai_price_min: min, ai_price_max: max }) });
    setSaving(false); setShowForm(false); load();
  };

  const handlePlaceBid = async () => {
    if (!bidListing || !bidPrice) return;
    setBidding(true);
    const res = await fetch('/api/oil/bids', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: bidListing.id, bid_price: Number(bidPrice) }) });
    setBidding(false);
    if (res.ok) { setBidDone(bidListing.listing_code); setBidListing(null); setBidPrice(''); load(); }
  };

  const listings = data?.listings || [];
  const chart    = (data?.chart || []).map((r: any) => ({ ...r, oil: Number(r.oil) }));
  const stats    = data?.stats || {};

  return (
    <div>
      <TopBar title="Oil Exchange" date="June 2026" />

      {bidDone && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between"
          style={{ background: '#F1F8F0', color: '#1B5E20', border: '1px solid #A7D7A9' }}>
          ✓ Bid placed on {bidDone} — seller will be notified
          <button onClick={() => setBidDone(null)}><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <StatCard label="Total Listings Active" value={String(stats.active_listings || 0)} change="+2 this week" changeType="up" icon={Droplets} color="green" />
        <StatCard label="Revenue This Month"    value={`₹${Number(stats.revenue || 0).toLocaleString('en-IN')}`} change="+18%" changeType="up" icon={IndianRupee} color="amber" />
        <StatCard label="Oil Diverted"          value={`${Number(stats.diverted || 0).toFixed(0)}`} unit="L" change="+12%" changeType="up" icon={Recycle} color="blue" />
        <StatCard label="AI Price Accuracy"     value="94" unit="%" change="Stable" changeType="stable" icon={TrendingUp} color="green" />
      </div>

      {/* Grade Legend */}
      <div className="flex items-center gap-3 mb-5 px-1">
        <span className="text-xs font-semibold" style={{ color: '#5B6B63' }}>OIL GRADE GUIDE:</span>
        {[
          { grade: 'A', label: 'Grade A — Premium', desc: 'Pure, filtered, FFA < 2%. Highest biodiesel yield. Best price.', color: '#1B5E20', bg: '#F1F8F0', border: '#A7D7A9' },
          { grade: 'B', label: 'Grade B — Standard', desc: 'Light sediment, FFA 2–5%. Good yield after processing.', color: '#F59E0B', bg: '#FDF3E3', border: '#FCD68A' },
          { grade: 'C', label: 'Grade C — Basic', desc: 'Mixed/unfiltered, FFA > 5%. Lower yield, needs extra refining.', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
        ].map(({ grade, label, desc, color, bg, border }) => (
          <div key={grade} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium group relative cursor-default"
            style={{ background: bg, borderColor: border, color }}>
            <span className="font-bold">{grade}</span>
            <span style={{ color: '#5B6B63' }}>{label.split('— ')[1]}</span>
            {/* Tooltip */}
            <div className="absolute top-8 left-0 z-50 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs leading-relaxed hidden group-hover:block" style={{ color: '#374151' }}>
              <div className="font-bold mb-1" style={{ color }}>{label}</div>
              {desc}
            </div>
          </div>
        ))}
        <span className="text-xs ml-1" style={{ color: '#9CA3AF' }}>hover for details</span>
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>{canList ? 'MY OIL LISTINGS' : 'AVAILABLE OIL LISTINGS'}</h3>
            {canList && (
              <button onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
                <Plus size={15} /> New Listing
              </button>
            )}
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
                <input required type="number" value={form.quantity_liters}
                  onChange={e => setForm(f => ({ ...f, quantity_liters: e.target.value }))}
                  placeholder="e.g. 100" className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-28" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Grade</label>
                <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <option value="A">Grade A</option><option value="B">Grade B</option><option value="C">Grade C</option>
                </select>
              </div>
              {form.quantity_liters && (
                <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#F1F8F0', color: '#1B5E20' }}>
                  AI Price: ₹{calcAIPrice(form.oil_type, form.grade, Number(form.quantity_liters)).min}–
                  {calcAIPrice(form.oil_type, form.grade, Number(form.quantity_liters)).max}/L
                </div>
              )}
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
                {saving ? 'Saving...' : 'Add Listing'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
            </form>
          )}

          {loading ? <div className="text-sm text-gray-400 py-4 text-center">Loading...</div> : listings.length === 0 ? (
            <div className="text-sm text-gray-400 py-8 text-center">No listings yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['ID', 'Type', 'Qty', 'Grade', 'AI Price Range', isBuyer ? 'Seller' : 'Bids', 'Status', isBuyer ? 'Action' : ''].filter(Boolean).map(h => (
                    <th key={h} className="text-left pb-3 font-medium text-xs" style={{ color: '#5B6B63' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l: any, i: number) => {
                  const s = statusColors[l.status] || { color: '#5B6B63', bg: '#F5F5F5' };
                  const myBid = l.my_bid;
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-semibold text-xs" style={{ color: '#1B5E20' }}>{l.listing_code}</td>
                      <td className="py-3 text-xs" style={{ color: '#1F2A24' }}>{l.oil_type}</td>
                      <td className="py-3 text-xs">{l.quantity_liters} L</td>
                      <td className="py-3">
                        <span className="text-xs px-2 py-1 rounded font-semibold" style={{
                          color: l.grade === 'A' ? '#1B5E20' : l.grade === 'B' ? '#D97706' : '#DC2626',
                          background: l.grade === 'A' ? '#F1F8F0' : l.grade === 'B' ? '#FDF3E3' : '#FEF2F2',
                        }}>
                          {l.grade === 'A' ? 'A — Premium' : l.grade === 'B' ? 'B — Standard' : 'C — Basic'}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-xs" style={{ color: '#F59E0B' }}>₹{l.ai_price_min}–{l.ai_price_max}/L</td>
                      {isBuyer
                        ? <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{l.seller_name || '—'}</td>
                        : <td className="py-3 font-semibold text-center text-xs">{l.bids}</td>}
                      <td className="py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: s.color, background: s.bg }}>{l.status}</span>
                      </td>
                      {isBuyer && (
                        <td className="py-3">
                          {myBid ? (
                            <span className="text-xs font-semibold" style={{ color: '#1B5E20' }}>
                              ✓ Bid: ₹{myBid}/L
                            </span>
                          ) : (
                            <button onClick={() => { setBidListing(l); setBidPrice(String(l.ai_price_min)); }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                              style={{ background: '#1B5E20' }}>
                              Place Bid
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* AI Estimator */}
        <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} style={{ color: '#F59E0B' }} />
            <h3 className="font-bold text-sm" style={{ color: '#1F2A24' }}>AI PRICE ESTIMATOR</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Oil Type</label>
              <select value={estType} onChange={e => { setEstType(e.target.value); setAiResult(null); }}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                <option>Cooking Oil (Refined)</option><option>Palm Oil (Used)</option>
                <option>Lubricant Oil</option><option>Mustard Oil (Used)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Volume (Litres)</label>
              <input type="number" value={estVol} onChange={e => { setEstVol(Number(e.target.value)); setAiResult(null); }}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Grade</label>
              <select value={estGrade} onChange={e => { setEstGrade(e.target.value); setAiResult(null); }}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                <option value="A">Grade A — Premium</option>
                <option value="B">Grade B — Standard</option>
                <option value="C">Grade C — Basic</option>
              </select>
            </div>
            <button onClick={() => { setAiLoading(true); setTimeout(() => { setAiResult(calcAIPrice(estType, estGrade, estVol)); setAiLoading(false); }, 600); }}
              disabled={aiLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: '#1B5E20' }}>
              {aiLoading ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Calculating...</> : <><Sparkles size={13} /> Get AI Price</>}
            </button>
            <div className="rounded-xl p-3 text-center" style={{ background: aiResult ? '#F1F8F0' : '#F9FAFB' }}>
              <div className="text-xs mb-1" style={{ color: '#5B6B63' }}>{aiResult ? 'AI Suggested Range' : 'Fill fields & click Get AI Price'}</div>
              <div className="text-xl font-bold" style={{ color: aiResult ? '#1B5E20' : '#9CA3AF', fontFamily: 'Georgia, serif' }}>
                {aiResult ? `₹${aiResult.min} – ₹${aiResult.max}/L` : '— /L'}
              </div>
              {aiResult && <div className="text-xs mt-1" style={{ color: '#5B6B63' }}>Total: ₹{(aiResult.min * estVol).toLocaleString('en-IN')} – ₹{(aiResult.max * estVol).toLocaleString('en-IN')}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {bidListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>Place Bid — {bidListing.listing_code}</h3>
              <button onClick={() => setBidListing(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="rounded-xl p-4 mb-4 space-y-1" style={{ background: '#F8FAF8' }}>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Oil Type</span>
                <span className="font-medium" style={{ color: '#1F2A24' }}>{bidListing.oil_type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quantity</span>
                <span className="font-medium" style={{ color: '#1F2A24' }}>{bidListing.quantity_liters} L</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Grade</span>
                <span className="font-semibold text-xs px-2 py-0.5 rounded" style={{
                          color: bidListing.grade === 'A' ? '#1B5E20' : bidListing.grade === 'B' ? '#D97706' : '#DC2626',
                          background: bidListing.grade === 'A' ? '#F1F8F0' : bidListing.grade === 'B' ? '#FDF3E3' : '#FEF2F2',
                        }}>
                          {bidListing.grade === 'A' ? 'Grade A — Premium' : bidListing.grade === 'B' ? 'Grade B — Standard' : 'Grade C — Basic'}
                        </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">AI Price Range</span>
                <span className="font-semibold" style={{ color: '#F59E0B' }}>₹{bidListing.ai_price_min}–{bidListing.ai_price_max}/L</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-2" style={{ color: '#1F2A24' }}>Your Bid Price (₹ per litre)</label>
              <input type="number" value={bidPrice} onChange={e => setBidPrice(e.target.value)}
                className="w-full text-lg font-bold border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-600"
                style={{ color: '#1B5E20' }} placeholder="Enter price per litre" />
              {bidPrice && (
                <div className="mt-2 text-sm font-medium" style={{ color: '#5B6B63' }}>
                  Total order value: <span style={{ color: '#1B5E20' }}>₹{(Number(bidPrice) * bidListing.quantity_liters).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBidListing(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handlePlaceBid} disabled={bidding || !bidPrice}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#1B5E20' }}>
                {bidding ? 'Placing...' : 'Confirm Bid'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>OIL DIVERTED — LAST 6 MONTHS</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chart} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={(v: number) => `${v}L`} />
            <Tooltip formatter={(v: any) => [`${v} L`, 'Oil']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Bar dataKey="oil" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
