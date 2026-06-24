'use client';
import { useEffect, useState } from 'react';
import { Plus, Cpu, IndianRupee, PackageCheck, Recycle, Sparkles, X, ShoppingCart, CheckCircle2, Tag, Wrench, RefreshCw, Heart, Leaf, AlertTriangle, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import { useUser } from '@/lib/useUser';

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
  const user = useUser();
  const canList = user?.role === 'admin' || user?.role === 'dept_head' || user?.role === 'recycler';
  const isBuyer = user?.role === 'buyer';
  const isRecycler = user?.role === 'recycler';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ item_name: '', category: 'laptop', brand: '', condition: 'working', ai_triage: 'resell', ai_price_min: '', ai_price_max: '' });
  const [saving, setSaving] = useState(false);
  const [buying, setBuying] = useState<number | null>(null);
  const [buyModal, setBuyModal] = useState<any | null>(null);
  const [buyDone, setBuyDone] = useState(false);

  // AI Triage Estimator state
  const [estCat, setEstCat] = useState('laptop');
  const [estCond, setEstCond] = useState('working');
  const [estCosmetic, setEstCosmetic] = useState('good');
  const [estFunctional, setEstFunctional] = useState('fully_functional');
  const [estBrand, setEstBrand] = useState('');
  const [estAge, setEstAge] = useState('1-3');
  const [estAcc, setEstAcc] = useState('yes');
  const [estLoading, setEstLoading] = useState(false);
  const [estResult, setEstResult] = useState<{ triage: string, min: number, max: number } | null>(null);

  const calcEwasteAI = (category: string, condition: string, cosmetic: string, functional: string, brand: string, age: string, acc: string) => {
    let base = 5000;
    if (category === 'laptop') base = 25000;
    else if (category === 'mobile') base = 12000;
    else if (category === 'monitor') base = 8000;
    else if (category === 'battery') base = 500;
    else if (category === 'accessories') base = 300;
    
    const b = brand.toLowerCase();
    if (b.includes('apple') || b.includes('mac')) base *= 1.5;
    else if (b.includes('dell') || b.includes('hp') || b.includes('samsung')) base *= 1.1;

    let ageMult = 1.0;
    if (age === '<1') ageMult = 1.2;
    else if (age === '1-3') ageMult = 0.8;
    else if (age === '3-5') ageMult = 0.5;
    else if (age === '>5') ageMult = 0.3;
    base *= ageMult;

    if (acc === 'yes') base *= 1.1;

    let cosmeticMult = 1.0;
    if (cosmetic === 'flawless') cosmeticMult = 1.2;
    else if (cosmetic === 'good') cosmeticMult = 1.0;
    else if (cosmetic === 'fair') cosmeticMult = 0.8;
    else if (cosmetic === 'poor') cosmeticMult = 0.5;
    base *= cosmeticMult;

    let funcMult = 1.0;
    if (functional === 'fully_functional') funcMult = 1.0;
    else if (functional === 'battery_issues') funcMult = 0.8;
    else if (functional === 'screen_issues') funcMult = 0.6;
    else if (functional === 'logic_board_issues') funcMult = 0.3;
    base *= funcMult;

    let triage = 'recycle';
    let mult = 0.1;
    if (condition === 'working' && functional === 'fully_functional') { triage = 'resell'; mult = 1.0; }
    else if (condition === 'repairable' || functional !== 'fully_functional') { triage = 'repair'; mult = 0.4; }
    else if (condition === 'mixed') { triage = 'donate'; mult = 0.2; }
    
    // Auto-adjust triage for old items
    if (age === '>5' && triage === 'resell') triage = 'donate';
    
    return { triage, min: Math.round(base * mult * 0.8), max: Math.round(base * mult * 1.2) };
  };

  const handleEstimate = () => {
    setEstLoading(true);
    setTimeout(() => {
      setEstResult(calcEwasteAI(estCat, estCond, estCosmetic, estFunctional, estBrand, estAge, estAcc));
      setEstLoading(false);
    }, 600);
  };

  const load = () => fetch('/api/ewaste').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
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

  const handleBuy = async () => {
    if (!buyModal) return;
    setBuying(buyModal.id);
    await fetch('/api/ewaste/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: buyModal.id }),
    });
    setBuying(null);
    setBuyDone(true);
    setTimeout(() => { setBuyDone(false); setBuyModal(null); load(); }, 1800);
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
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>{canList ? 'MY E-WASTE LISTINGS' : 'AVAILABLE E-WASTE'}</h3>
            {canList && (
              <button onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
                <Plus size={15} /> List Item
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              {/* AI auto-fill banner for recyclers */}
              {(canList || isRecycler) && estResult && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-green-200" style={{ background: '#F1F8F0' }}>
                  <div className="text-xs" style={{ color: '#1B5E20' }}>
                    <span className="font-bold">AI Estimate ready</span> — Triage: <span className="capitalize font-semibold">{estResult.triage}</span> · ₹{estResult.min.toLocaleString('en-IN')}–₹{estResult.max.toLocaleString('en-IN')}
                  </div>
                  <button type="button" onClick={() => setForm(f => ({
                    ...f,
                    ai_triage: estResult.triage,
                    ai_price_min: String(estResult.min),
                    ai_price_max: String(estResult.max),
                    category: estCat,
                    condition: estCond,
                    brand: estBrand,
                  }))}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0 ml-3"
                    style={{ background: '#1B5E20' }}>
                    <Sparkles size={11} className="inline mr-1" />Use AI Values
                  </button>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
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
              </div>
              <div className="flex gap-2">
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
                  {['ID', 'Item', 'Category', 'Condition', 'AI Triage', 'AI Value', 'Status', isBuyer ? 'Action' : ''].filter(Boolean).map(h => (
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
                      {isBuyer && (
                        <td className="py-3">
                          {item.status === 'listed' ? (
                            <button onClick={() => { setBuyModal(item); setBuyDone(false); }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                              style={{ background: '#1B5E20' }}>
                              Buy Now
                            </button>
                          ) : item.status === 'matched' ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#2196F3', background: '#E8F2FC' }}>Sold</span>
                          ) : (
                            <span className="text-xs font-semibold" style={{ color: '#5B6B63' }}>—</span>
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

        <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} style={{ color: '#F59E0B' }} />
            <h3 className="font-bold text-sm" style={{ color: '#1F2A24' }}>AI TRIAGE ESTIMATOR</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Category</label>
              <select value={estCat} onChange={e => { setEstCat(e.target.value); setEstResult(null); }}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                <option value="laptop">Laptop</option><option value="mobile">Mobile</option>
                <option value="monitor">Monitor</option><option value="battery">Battery</option>
                <option value="accessories">Accessories</option><option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Brand (Optional)</label>
              <input type="text" placeholder="e.g. Apple, Dell" value={estBrand} onChange={e => { setEstBrand(e.target.value); setEstResult(null); }}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Overall Condition</label>
              <select value={estCond} onChange={e => { setEstCond(e.target.value); setEstResult(null); }}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                <option value="working">Working</option><option value="repairable">Repairable</option>
                <option value="dead">Dead</option><option value="mixed">Mixed</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Cosmetics</label>
                <select value={estCosmetic} onChange={e => { setEstCosmetic(e.target.value); setEstResult(null); }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white">
                  <option value="flawless">Flawless</option><option value="good">Good</option>
                  <option value="fair">Fair (Dents)</option><option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Functionality</label>
                <select value={estFunctional} onChange={e => { setEstFunctional(e.target.value); setEstResult(null); }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white">
                  <option value="fully_functional">100% OK</option><option value="battery_issues">Battery Bad</option>
                  <option value="screen_issues">Screen Bad</option><option value="logic_board_issues">Board Dead</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Device Age</label>
                <select value={estAge} onChange={e => { setEstAge(e.target.value); setEstResult(null); }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white">
                  <option value="<1">&lt; 1 yr</option><option value="1-3">1-3 yrs</option>
                  <option value="3-5">3-5 yrs</option><option value=">5">&gt; 5 yrs</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Accessories</label>
                <select value={estAcc} onChange={e => { setEstAcc(e.target.value); setEstResult(null); }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white">
                  <option value="yes">Included</option><option value="no">Missing</option>
                </select>
              </div>
            </div>
            <button onClick={handleEstimate} disabled={estLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: '#1B5E20' }}>
              {estLoading ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</> : <><Sparkles size={13} /> Run AI Triage</>}
            </button>
            <div className="rounded-xl p-3 text-center" style={{ background: estResult ? '#F1F8F0' : '#F9FAFB' }}>
              <div className="text-xs mb-1" style={{ color: '#5B6B63' }}>{estResult ? 'AI Suggested Triage' : 'Fill fields & click Run'}</div>
              {estResult ? (
                <>
                  <div className="text-lg font-bold capitalize mb-1" style={{ color: triageColors[estResult.triage] || '#1B5E20' }}>
                    {estResult.triage}
                  </div>
                  <div className="text-sm font-bold" style={{ color: '#F59E0B' }}>
                    ₹{estResult.min.toLocaleString('en-IN')} – ₹{estResult.max.toLocaleString('en-IN')}
                  </div>
                </>
              ) : (
                <div className="text-xl font-bold" style={{ color: '#9CA3AF', fontFamily: 'Georgia, serif' }}>—</div>
              )}
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl" style={{ background: '#F1F8F0' }}>
            <div className="text-xs font-medium mb-1" style={{ color: '#5B6B63' }}>CPCB Authorized Recyclers</div>
            <div className="text-sm font-bold" style={{ color: '#1B5E20' }}>12 verified in Indore</div>
          </div>
        </div>
      </div>

      {/* ── Purchase Confirmation Modal ── */}
      {buyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

            {buyDone ? (
              <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#F1F8F0' }}>
                  <CheckCircle2 size={36} style={{ color: '#1B5E20' }} />
                </div>
                <div className="text-xl font-bold mb-2" style={{ color: '#1B5E20', fontFamily: 'Georgia, serif' }}>Order Confirmed!</div>
                <div className="text-sm" style={{ color: '#5B6B63' }}>
                  {buyModal.item_name} has been reserved for you.<br />Check <span className="font-semibold">My Orders</span> for details.
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} style={{ color: '#1B5E20' }} />
                    <span className="font-bold text-base" style={{ color: '#1F2A24' }}>Confirm Purchase</span>
                  </div>
                  <button onClick={() => setBuyModal(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>

                {/* Item details */}
                <div className="px-6 py-5">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F1F8F0' }}>
                      <Cpu size={22} style={{ color: '#1B5E20' }} />
                    </div>
                    <div>
                      <div className="font-bold text-base" style={{ color: '#1F2A24' }}>{buyModal.item_name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#5B6B63' }}>
                        {buyModal.listing_code} · {buyModal.seller_name || 'Campus Seller'}
                      </div>
                    </div>
                  </div>

                  {/* Quick meta row */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl p-3" style={{ background: '#F9FAFB' }}>
                      <div className="text-xs mb-1" style={{ color: '#5B6B63' }}>Category</div>
                      <div className="text-sm font-semibold capitalize" style={{ color: '#1F2A24' }}>{buyModal.category}</div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: '#F9FAFB' }}>
                      <div className="text-xs mb-1" style={{ color: '#5B6B63' }}>Condition</div>
                      <div className="text-sm font-semibold capitalize" style={{ color: '#1F2A24' }}>{buyModal.condition}</div>
                    </div>
                  </div>

                  {/* ── AI Triage Analysis Panel ── */}
                  {(() => {
                    const triageMap: Record<string, {
                      icon: any; color: string; bg: string; border: string;
                      label: string; headline: string; desc: string; impact: string; action: string;
                    }> = {
                      resell:  { icon: Tag,       color: '#1B5E20', bg: '#F1F8F0', border: '#BBF7D0',
                                 label: 'Resell',  headline: 'Ready to Resell',
                                 desc:  'AI assessed this item as fully functional with high resale value. It passed condition, cosmetic, and functionality checks.',
                                 impact: 'Keeps device in use — avoids ~18 kg CO₂ from manufacturing a replacement.',
                                 action: 'Collect & resell directly or list on a secondary market.' },
                      repair:  { icon: Wrench,    color: '#2196F3', bg: '#E8F2FC', border: '#BFDBFE',
                                 label: 'Repair',  headline: 'Repairable Device',
                                 desc:  'AI detected partial defects (battery, screen, or board). With minor repairs this item can be fully restored.',
                                 impact: 'Repair extends device life by 2–4 years, saving ~12 kg CO₂.',
                                 action: 'Send to a CPCB-authorised repair centre in Indore.' },
                      recycle: { icon: RefreshCw, color: '#D97706', bg: '#FDF3E3', border: '#FDE68A',
                                 label: 'Recycle', headline: 'Recommended for Recycling',
                                 desc:  'AI determined this item is past its useful life. Responsible recycling recovers valuable metals and prevents toxic landfill.',
                                 impact: 'Proper recycling recovers Au, Cu, Pd — worth ₹200–800 in raw materials.',
                                 action: 'Route to one of 12 CPCB-verified recyclers in Indore.' },
                      donate:  { icon: Heart,     color: '#9333EA', bg: '#FAF5FF', border: '#DDD6FE',
                                 label: 'Donate',  headline: 'Suitable for Donation',
                                 desc:  'AI classified this item as functional but dated. Donating extends its utility for educational or community use.',
                                 impact: 'Donation avoids disposal and benefits a recipient directly.',
                                 action: 'Connect with NGO partners for same-week collection.' },
                    };
                    const t = triageMap[buyModal.ai_triage] || triageMap['recycle'];
                    const TriageIcon = t.icon;
                    return (
                      <div className="rounded-xl border p-4 mb-4" style={{ background: t.bg, borderColor: t.border }}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: t.color + '22' }}>
                            <Sparkles size={13} style={{ color: t.color }} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.color }}>AI Triage Result</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.color + '18' }}>
                            <TriageIcon size={18} style={{ color: t.color }} />
                          </div>
                          <div>
                            <div className="font-bold text-sm mb-0.5" style={{ color: t.color }}>{t.headline}</div>
                            <div className="text-xs leading-relaxed" style={{ color: '#4B5563' }}>{t.desc}</div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-start gap-2 text-xs" style={{ color: '#5B6B63' }}>
                            <Leaf size={11} className="mt-0.5 flex-shrink-0" style={{ color: '#1B5E20' }} />
                            <span><span className="font-semibold">Environmental impact: </span>{t.impact}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs" style={{ color: '#5B6B63' }}>
                            <Info size={11} className="mt-0.5 flex-shrink-0" style={{ color: '#2196F3' }} />
                            <span><span className="font-semibold">Recommended action: </span>{t.action}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: t.border }}>
                          <span className="text-xs" style={{ color: '#5B6B63' }}>AI Estimated Value</span>
                          <span className="text-sm font-bold" style={{ color: '#F59E0B' }}>
                            ₹{Number(buyModal.ai_price_min).toLocaleString('en-IN')} – ₹{Number(buyModal.ai_price_max).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2" style={{ background: '#FFFBEB', color: '#92400E' }}>
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                    By confirming, you agree to collect this item within <span className="font-semibold mx-1">5 working days</span>. Payment is handled directly between parties.
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setBuyModal(null)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={handleBuy} disabled={buying === buyModal.id}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: '#1B5E20' }}>
                      {buying === buyModal.id
                        ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirming...</>
                        : <><ShoppingCart size={14} /> Confirm Purchase</>}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
