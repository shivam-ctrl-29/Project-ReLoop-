'use client';
import { useEffect, useState } from 'react';
import {
  Droplets, IndianRupee, Wind, ShieldCheck, Truck, FileDown,
  History, Search, Recycle, Cpu, ArrowRight, Package, Clock, CheckCircle,
  CheckCircle2, XCircle, AlertCircle, Users, TrendingUp, Leaf, Zap, FlaskConical
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import AlertBanner from '../../components/AlertBanner';
import { useUser } from '@/lib/useUser';
import Link from 'next/link';

const statusColors: Record<string, { color: string; bg: string }> = {
  collected: { color: '#1B5E20', bg: '#F1F8F0' },
  scheduled:  { color: '#F59E0B', bg: '#FDF3E3' },
  requested:  { color: '#2196F3', bg: '#E8F2FC' },
  confirmed:  { color: '#1B5E20', bg: '#F1F8F0' },
};

// ── Admin / Dept Head Dashboard ──────────────────────────────────────────────
function AdminDashboard() {
  const [data, setData]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const load = () =>
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const cancelPickup = async (id: number) => {
    setCancelling(id);
    await fetch('/api/pickups', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'cancelled' }),
    });
    setCancelling(null);
    load();
  };

  const s = data?.stats || {};
  const pickups = data?.pickups || [];
  const chart = data?.chart || [];
  const profit = data?.profit || {};

  const quickActions = [
    { icon: Truck,    label: 'Schedule a Pickup',    sub: "We'll collect your used oil",  href: '/schedule' },
    { icon: FileDown, label: 'Download Certificate',  sub: 'For FSSAI records',            href: '/compliance' },
    { icon: History,  label: 'Collection History',    sub: 'All past pickups',             href: '/collections' },
  ];

  return (
    <div>
      <TopBar title="Dashboard" date="June 2026" />
      <AlertBanner message="Pickup routes in Indore may be delayed Monday due to heavy rainfall" action="Check Schedule" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Oil Collected This Month" value={loading ? '—' : `${Number(s.oil_kg||0).toFixed(0)}`} unit="L" change="+12%" changeType="up" icon={Droplets} color="green" />
        <StatCard label="Earnings from Oil" value={loading ? '—' : `₹${Number(s.earnings||0).toLocaleString('en-IN')}`} change="+8%" changeType="up" icon={IndianRupee} color="amber" />
        <StatCard label="CO2 Saved" value={loading ? '—' : `${Number(s.co2||0).toFixed(1)}`} unit="T" change="Stable" changeType="stable" icon={Wind} color="blue" />
        <StatCard label="Compliance Docs Ready" value={loading ? '—' : String(s.docs||0)} change="Updated" changeType="info" icon={ShieldCheck} color="green" />
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>MY PICKUPS</h3>
            <Link href="/schedule" className="text-sm font-medium" style={{ color: '#1B5E20' }}>View All</Link>
          </div>
          {loading ? (
            <div className="text-sm text-gray-400 py-4 text-center">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Date','Quantity','Status','Action'].map(h => (
                    <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pickups.slice(0,3).map((p: any, i: number) => {
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
                        {p.status === 'collected' && (
                          <Link href="/compliance" className="text-xs font-semibold" style={{ color: '#1B5E20' }}>
                            Certificate →
                          </Link>
                        )}
                        {(p.status === 'scheduled' || p.status === 'confirmed') && (
                          <Link href="/schedule" className="text-xs font-semibold" style={{ color: '#2196F3' }}>
                            Details →
                          </Link>
                        )}
                        {p.status === 'requested' && (
                          <button
                            onClick={() => cancelPickup(p.id)}
                            disabled={cancelling === p.id}
                            className="text-xs font-semibold disabled:opacity-50"
                            style={{ color: '#DC2626' }}>
                            {cancelling === p.id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}
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
            {quickActions.map(({ icon: Icon, label, sub, href }, i) => (
              <Link key={i} href={href} className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-left transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F8F0' }}>
                  <Icon size={16} style={{ color: '#1B5E20' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#1F2A24' }}>{label}</div>
                  <div className="text-xs" style={{ color: '#5B6B63' }}>{sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Financial P&L Section ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F1F8F0' }}>
            <TrendingUp size={18} style={{ color: '#1B5E20' }} />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>FINANCIAL IMPACT — YTD 2026</h3>
            <p className="text-xs" style={{ color: '#5B6B63' }}>Direct revenue + cost savings from circular resource management</p>
          </div>
          {!loading && (
            <div className="ml-auto text-right">
              <div className="text-xs font-medium mb-0.5" style={{ color: '#5B6B63' }}>Total Benefit to Institution</div>
              <div className="text-2xl font-black" style={{ color: '#1B5E20', fontFamily: 'Georgia, serif' }}>
                ₹{Number(profit.total_profit || 0).toLocaleString('en-IN')}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Revenue column */}
          <div className="rounded-2xl p-4 border border-green-100" style={{ background: '#F1F8F0' }}>
            <div className="flex items-center gap-2 mb-3">
              <IndianRupee size={14} style={{ color: '#1B5E20' }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#1B5E20' }}>Direct Revenue</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs" style={{ color: '#5B6B63' }}>
                  <FlaskConical size={11} /> Oil Exchange Sales
                </div>
                <span className="text-sm font-bold" style={{ color: '#1F2A24' }}>₹{Number(profit.revenue_oil || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs" style={{ color: '#5B6B63' }}>
                  <Cpu size={11} /> E-Waste Market Sales
                </div>
                <span className="text-sm font-bold" style={{ color: '#1F2A24' }}>₹{Number(profit.revenue_ewaste || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 mt-1 border-t border-green-200 flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: '#1B5E20' }}>Total Revenue</span>
                <span className="text-base font-black" style={{ color: '#1B5E20' }}>₹{Number(profit.total_revenue || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Cost savings column */}
          <div className="rounded-2xl p-4 border border-blue-100" style={{ background: '#EFF6FF' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} style={{ color: '#2196F3' }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#2196F3' }}>Cost Savings</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs" style={{ color: '#5B6B63' }}>
                  <Droplets size={11} /> Water (₹5/L avoided)
                </div>
                <span className="text-sm font-bold" style={{ color: '#1F2A24' }}>₹{Number(profit.water_savings || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs" style={{ color: '#5B6B63' }}>
                  <Recycle size={11} /> Oil disposal (₹8/L avoided)
                </div>
                <span className="text-sm font-bold" style={{ color: '#1F2A24' }}>₹{Number(profit.oil_disposal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs" style={{ color: '#5B6B63' }}>
                  <Cpu size={11} /> E-waste disposal (₹500/item)
                </div>
                <span className="text-sm font-bold" style={{ color: '#1F2A24' }}>₹{Number(profit.ewaste_disposal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 mt-1 border-t border-blue-200 flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: '#2196F3' }}>Total Savings</span>
                <span className="text-base font-black" style={{ color: '#2196F3' }}>₹{Number(profit.total_cost_savings || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Carbon credits column */}
          <div className="rounded-2xl p-4 border border-amber-100" style={{ background: '#FFFBEB' }}>
            <div className="flex items-center gap-2 mb-3">
              <Leaf size={14} style={{ color: '#D97706' }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#D97706' }}>Carbon Credits</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#5B6B63' }}>CO₂ Offset</span>
                <span className="text-sm font-bold" style={{ color: '#1F2A24' }}>{Number(profit.co2_tons || 0).toFixed(1)} T</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#5B6B63' }}>Credit Rate</span>
                <span className="text-sm font-bold" style={{ color: '#1F2A24' }}>₹2,000/T</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#5B6B63' }}>Water Conserved</span>
                <span className="text-sm font-bold" style={{ color: '#1F2A24' }}>{(Number(profit.water_liters || 0)/1000).toFixed(1)} KL</span>
              </div>
              <div className="pt-2 mt-1 border-t border-amber-200 flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: '#D97706' }}>Carbon Value</span>
                <span className="text-base font-black" style={{ color: '#D97706' }}>₹{Number(profit.co2_credits || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total profit bar */}
        {!loading && (
          <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: '#1B5E20' }}>
            <div>
              <div className="text-white/70 text-xs font-medium mb-0.5">NET INSTITUTIONAL BENEFIT (Revenue + Cost Savings + Carbon Credits)</div>
              <div className="text-3xl font-black text-white" style={{ fontFamily: 'Georgia, serif' }}>
                ₹{Number(profit.total_profit || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-xs mb-1">Breakdown</div>
              <div className="text-xs text-white/90 space-y-0.5">
                <div>Revenue: ₹{Number(profit.total_revenue || 0).toLocaleString('en-IN')}</div>
                <div>Savings: ₹{Number(profit.total_cost_savings || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>OIL COLLECTED (LITRES) — 2026</h3>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#1B5E20' }} />
            <span className="text-xs" style={{ color: '#5B6B63' }}>Monthly Collection</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chart} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={(v: number) => `${v}L`} />
            <Tooltip formatter={(v: any) => [`${v} L`, 'Collected']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Bar dataKey="val" fill="#1B5E20" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Buyer Dashboard ──────────────────────────────────────────────────────────
function BuyerDashboard() {
  const [oilData, setOilData]       = useState<any>(null);
  const [ewasteData, setEwasteData] = useState<any>(null);
  const user = useUser();

  useEffect(() => {
    fetch('/api/oil').then(r => r.json()).then(setOilData).catch(() => {});
    fetch('/api/ewaste').then(r => r.json()).then(setEwasteData).catch(() => {});
  }, []);

  const oilListings    = oilData?.listings    || [];
  const ewasteListings = ewasteData?.listings || [];
  const totalOil       = oilListings.length;
  const totalEwaste    = ewasteListings.length;

  return (
    <div>
      <TopBar title="Marketplace" date="June 2026" />

      {/* Hero header */}
      <div className="mb-6 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)' }}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/60 uppercase mb-1">Circular Exchange Portal</p>
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              Welcome back, {user?.name?.split(' ')[0] ?? 'Buyer'}
            </h2>
            <p className="text-sm text-white/70">Browse verified campus resources and place your bids below.</p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{totalOil + totalEwaste}</div>
              <div className="text-xs text-white/60">Total listings</div>
            </div>
          </div>
        </div>
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #F59E0B, #FCD34D, #F59E0B)' }} />
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Oil Listings',    value: totalOil,    sub: 'Available to bid',  color: '#1B5E20', border: '#BBF7D0' },
          { label: 'E-Waste Items',   value: totalEwaste, sub: 'Graded & ready',    color: '#2196F3', border: '#BFDBFE' },
          { label: 'Active Markets',  value: 2,           sub: 'Oil + E-Waste',     color: '#F59E0B', border: '#FDE68A' },
        ].map(({ label, value, sub, color, border }) => (
          <div key={label} className="bg-white rounded-2xl border p-5" style={{ borderColor: border }}>
            <div className="text-3xl font-bold mb-1" style={{ color, fontFamily: 'Georgia, serif' }}>
              {oilData && ewasteData ? value : '—'}
            </div>
            <div className="text-sm font-semibold mb-0.5" style={{ color: '#1F2A24' }}>{label}</div>
            <div className="text-xs" style={{ color: '#9CA3AF' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Market cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          {
            icon: Recycle, label: 'Oil Exchange', href: '/oil-exchange',
            accent: '#1B5E20', light: '#F1F8F0',
            count: totalOil, unit: 'batches available',
            desc: 'Used cooking oil from campus kitchens — AI-priced, FSSAI-ready',
            cta: 'Browse Oil',
          },
          {
            icon: Cpu, label: 'E-Waste Market', href: '/ewaste',
            accent: '#2196F3', light: '#EFF6FF',
            count: totalEwaste, unit: 'items listed',
            desc: 'Laptops, phones, lab equipment — graded by AI triage system',
            cta: 'Browse E-Waste',
          },
        ].map(({ icon: Icon, label, href, accent, light, count, unit, desc, cta }) => (
          <Link key={label} href={href}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
            <div className="h-1.5" style={{ background: accent }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: light }}>
                  <Icon size={22} style={{ color: accent }} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: accent, fontFamily: 'Georgia, serif' }}>
                    {oilData && ewasteData ? count : '—'}
                  </div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>{unit}</div>
                </div>
              </div>
              <div className="text-base font-bold mb-1" style={{ color: '#1F2A24' }}>{label}</div>
              <div className="text-xs mb-4 leading-relaxed" style={{ color: '#6B7280' }}>{desc}</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all" style={{ color: accent }}>
                {cta} <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions for buyer */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h3 className="text-xs font-bold tracking-widest mb-4" style={{ color: '#9CA3AF' }}>QUICK ACTIONS</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Search,  label: 'Browse Oil',     href: '/oil-exchange', color: '#1B5E20', bg: '#F1F8F0' },
            { icon: Package, label: 'Browse E-Waste', href: '/ewaste',       color: '#2196F3', bg: '#EFF6FF' },
            { icon: Clock,   label: 'My Orders',      href: '/orders',       color: '#F59E0B', bg: '#FFF7ED' },
          ].map(({ icon: Icon, label, href, color, bg }) => (
            <Link key={label} href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 text-center transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: '#1F2A24' }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* How to use */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-xs font-bold tracking-widest mb-5" style={{ color: '#9CA3AF' }}>HOW IT WORKS</h3>
        <div className="flex gap-4">
          {[
            { n: 1, icon: Search,      label: 'Browse Listings', desc: 'Find oil or e-waste from verified campus institutions' },
            { n: 2, icon: IndianRupee, label: 'Place a Bid',     desc: 'Submit your price — seller gets notified instantly' },
            { n: 3, icon: CheckCircle, label: 'Get Verified',    desc: 'Approved bids generate a pickup & compliance certificate' },
          ].map(({ n, icon: Icon, label, desc }, i, arr) => (
            <div key={n} className="flex-1 flex gap-3 items-start">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#1B5E20' }}>{n}</div>
                {i < arr.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: '#E5E7EB', minHeight: 20 }} />}
              </div>
              <div className="pb-4">
                <div className="text-sm font-semibold mb-0.5" style={{ color: '#1F2A24' }}>{label}</div>
                <div className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Recycler Dashboard ──────────────────────────────────────────────────────
function RecyclerDashboard() {
  const [pickups, setPickups]   = useState<any[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);
  const user = useUser();

  const load = () =>
    fetch('/api/pickups').then(r => r.json()).then(d => setPickups(d.pickups || [])).catch(() => {});

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    await fetch('/api/pickups', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setUpdating(null);
    load();
  };

  const pending   = pickups.filter(p => ['requested','scheduled'].includes(p.status)).length;
  const confirmed = pickups.filter(p => p.status === 'confirmed').length;
  const completed = pickups.filter(p => p.status === 'collected').length;

  return (
    <div>
      <TopBar title="Recycler Hub" date="June 2026" />

      <div className="mb-6 p-5 rounded-2xl text-white" style={{ background: '#7C3AED' }}>
        <div className="text-lg font-bold mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          Welcome, {user?.name?.split(' ')[0] ?? 'Partner'}
        </div>
        <p className="text-sm text-white/80">Manage e-waste collection assignments and track your completed pickups.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="text-2xl font-bold mb-1" style={{ color: '#F59E0B' }}>{pending}</div>
          <div className="text-sm" style={{ color: '#5B6B63' }}>Awaiting Acceptance</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="text-2xl font-bold mb-1" style={{ color: '#2196F3' }}>{confirmed}</div>
          <div className="text-sm" style={{ color: '#5B6B63' }}>In Progress</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="text-2xl font-bold mb-1" style={{ color: '#1B5E20' }}>{completed}</div>
          <div className="text-sm" style={{ color: '#5B6B63' }}>Completed</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="text-2xl font-bold mb-1" style={{ color: '#7C3AED' }}>{pickups.length}</div>
          <div className="text-sm" style={{ color: '#5B6B63' }}>Total Assigned</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>ASSIGNED PICKUPS</h3>
        {pickups.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">No pickups assigned yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date', 'Type', 'Quantity', 'Buyer', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium text-xs" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pickups.map((p: any, i: number) => {
                const sc = statusColors[p.status] || { color: '#5B6B63', bg: '#F5F5F5' };
                const isUpdating = updating === p.id;
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 text-xs font-semibold" style={{ color: '#1F2A24' }}>
                      {new Date(p.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {p.time_slot && <div className="text-gray-400 font-normal">{p.time_slot}</div>}
                    </td>
                    <td className="py-3.5 text-xs capitalize" style={{ color: '#1F2A24' }}>{p.pickup_type || 'oil'}</td>
                    <td className="py-3.5 text-xs" style={{ color: '#1F2A24' }}>{p.quantity || '—'}</td>
                    <td className="py-3.5 text-xs" style={{ color: '#5B6B63' }}>{p.buyer_name || '—'}</td>
                    <td className="py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: sc.color, background: sc.bg }}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {(p.status === 'requested' || p.status === 'scheduled') && (
                        <button
                          onClick={() => updateStatus(p.id, 'confirmed')}
                          disabled={isUpdating}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 flex items-center gap-1"
                          style={{ background: '#2196F3' }}>
                          {isUpdating ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={11} />}
                          Accept
                        </button>
                      )}
                      {p.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(p.id, 'collected')}
                          disabled={isUpdating}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 flex items-center gap-1"
                          style={{ background: '#1B5E20' }}>
                          {isUpdating ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={11} />}
                          Mark Collected
                        </button>
                      )}
                      {p.status === 'collected' && (
                        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#1B5E20' }}>
                          <CheckCircle size={11} /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Link href="/schedule" className="mt-4 text-sm font-medium flex items-center gap-1" style={{ color: '#7C3AED' }}>
          View all pickups <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// ── Dept Head Dashboard ──────────────────────────────────────────────────────
function DeptHeadDashboard() {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = () =>
    fetch('/api/pickups').then(r => r.json())
      .then(d => { setPickups(Array.isArray(d?.pickups) ? d.pickups : []); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const approve = async (id: number) => {
    setUpdating(id);
    await fetch('/api/pickups', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'confirmed' }) });
    setUpdating(null); load();
  };

  const reject = async (id: number) => {
    setUpdating(id);
    await fetch('/api/pickups', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'cancelled' }) });
    setUpdating(null); load();
  };

  const pending   = pickups.filter(p => p.status === 'requested');
  const active    = pickups.filter(p => ['scheduled', 'confirmed'].includes(p.status));
  const completed = pickups.filter(p => ['collected', 'cancelled'].includes(p.status));

  const statusBadge: Record<string, { color: string; bg: string; label: string }> = {
    requested: { color: '#D97706', bg: '#FDF3E3', label: 'Awaiting Approval' },
    scheduled:  { color: '#2196F3', bg: '#E8F2FC', label: 'Scheduled' },
    confirmed:  { color: '#1B5E20', bg: '#F1F8F0', label: 'Confirmed' },
    collected:  { color: '#5B6B63', bg: '#F5F5F5', label: 'Collected' },
    cancelled:  { color: '#DC2626', bg: '#FEF2F2', label: 'Cancelled' },
  };

  const PickupRow = ({ p, showActions }: { p: any; showActions?: boolean }) => {
    const sb = statusBadge[p.status] || { color: '#5B6B63', bg: '#F5F5F5', label: p.status };
    const dateStr = new Date(p.scheduled_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    return (
      <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F1F8F0' }}>
            {p.pickup_type === 'ewaste' ? <Package size={15} style={{ color: '#1B5E20' }} /> : <Truck size={15} style={{ color: '#1B5E20' }} />}
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#1F2A24' }}>
              {dateStr} · {p.time_slot}
            </div>
            <div className="text-xs mt-0.5 capitalize" style={{ color: '#5B6B63' }}>
              {p.pickup_type} · {p.quantity || '—'} · <span className="font-medium">{p.requester_name || 'Unknown'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: sb.color, background: sb.bg }}>{sb.label}</span>
          {showActions && (
            <>
              <button onClick={() => approve(p.id)} disabled={updating === p.id}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl text-white disabled:opacity-50"
                style={{ background: '#1B5E20' }}>
                {updating === p.id ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={11} />}
                Approve
              </button>
              <button onClick={() => reject(p.id)} disabled={updating === p.id}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-red-200 disabled:opacity-50"
                style={{ color: '#DC2626', background: '#FEF2F2' }}>
                <XCircle size={11} /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <TopBar title="Dept Head — Pickup Verification" date="June 2026" />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Awaiting Approval', value: pending.length,   color: '#D97706', bg: '#FDF3E3', icon: AlertCircle },
          { label: 'Active Pickups',    value: active.length,    color: '#2196F3', bg: '#E8F2FC', icon: Truck },
          { label: 'Completed',         value: completed.filter(p => p.status === 'collected').length, color: '#1B5E20', bg: '#F1F8F0', icon: CheckCircle2 },
          { label: 'Total Requests',    value: pickups.length,   color: '#5B6B63', bg: '#F5F5F5', icon: Users },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#1F2A24' }}>{loading ? '—' : value}</div>
              <div className="text-xs" style={{ color: '#5B6B63' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approval */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FDF3E3' }}>
            <AlertCircle size={16} style={{ color: '#D97706' }} />
          </div>
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>PENDING APPROVAL</h3>
          {pending.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: '#D97706', background: '#FDF3E3' }}>
              {pending.length} new
            </span>
          )}
        </div>
        {loading ? (
          <div className="text-sm text-gray-400 text-center py-6">Loading...</div>
        ) : pending.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl text-sm" style={{ background: '#F1F8F0' }}>
            <CheckCircle2 size={16} style={{ color: '#1B5E20' }} />
            <span style={{ color: '#1B5E20' }} className="font-medium">All caught up — no pickups awaiting approval</span>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map(p => <PickupRow key={p.id} p={p} showActions />)}
          </div>
        )}
      </div>

      {/* Active & Scheduled */}
      {active.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8F2FC' }}>
              <Truck size={16} style={{ color: '#2196F3' }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>ACTIVE PICKUPS</h3>
          </div>
          <div className="space-y-2">
            {active.map(p => <PickupRow key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {/* Completed History */}
      {completed.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F5F5F5' }}>
              <History size={16} style={{ color: '#5B6B63' }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>HISTORY</h3>
          </div>
          <div className="space-y-2">
            {completed.slice(0, 10).map(p => <PickupRow key={p.id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Entry point — picks the right view ──────────────────────────────────────
export default function DashboardPage() {
  const user = useUser();
  if (!user) return <div className="p-8 text-gray-400 text-sm">Loading...</div>;
  if (user.role === 'buyer')     return <BuyerDashboard />;
  if (user.role === 'recycler')  return <RecyclerDashboard />;
  if (user.role === 'dept_head') return <DeptHeadDashboard />;
  return <AdminDashboard />;
}
