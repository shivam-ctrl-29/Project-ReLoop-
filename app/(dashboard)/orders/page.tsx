'use client';
import { useEffect, useState } from 'react';
import { ShoppingBag, Recycle, Clock, CheckCircle2, XCircle, IndianRupee, ArrowRight, Cpu, FlaskConical, ShieldCheck, ShieldAlert, Gauge } from 'lucide-react';
import TopBar from '../../components/TopBar';
import Link from 'next/link';

const bidStatus: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  pending:  { color: '#F59E0B', bg: '#FDF3E3', label: 'Pending',  icon: Clock },
  accepted: { color: '#1B5E20', bg: '#F1F8F0', label: 'Accepted', icon: CheckCircle2 },
  rejected: { color: '#DC2626', bg: '#FEF2F2', label: 'Rejected', icon: XCircle },
};

const gradeStyle: Record<string, { color: string; bg: string; label: string }> = {
  A: { color: '#1B5E20', bg: '#F1F8F0', label: 'Grade A — Premium' },
  B: { color: '#D97706', bg: '#FDF3E3', label: 'Grade B — Standard' },
  C: { color: '#DC2626', bg: '#FEF2F2', label: 'Grade C — Basic' },
};

export default function OrdersPage() {
  const [bids, setBids]               = useState<any[]>([]);
  const [ewasteOrders, setEwasteOrders] = useState<any[]>([]);
  const [pickups, setPickups]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [cancelling, setCancelling]   = useState<number | null>(null);

  const load = () => {
    Promise.all([
      fetch('/api/oil/bids').then(r => r.json()),
      fetch('/api/ewaste/orders').then(r => r.json()),
      fetch('/api/pickups').then(r => r.json()),
    ]).then(([oil, ewaste, pkp]) => {
      setBids(Array.isArray(oil) ? oil : []);
      setEwasteOrders(Array.isArray(ewaste) ? ewaste : []);
      setPickups(Array.isArray(pkp?.pickups) ? pkp.pickups : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cancelBid = async (bidId: number) => {
    setCancelling(bidId);
    await fetch('/api/oil/bids', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bid_id: bidId }),
    });
    setCancelling(null);
    load();
  };

  const pending    = bids.filter(b => b.status === 'pending').length;
  const accepted   = bids.filter(b => b.status === 'accepted').length + ewasteOrders.length;
  const totalValue = bids.reduce((s, b) => s + Number(b.bid_price) * Number(b.quantity_liters), 0)
    + ewasteOrders.reduce((s, o) => s + (Number(o.ai_price_max) + Number(o.ai_price_min)) / 2, 0);

  // Pickups with driver verification data for accepted bids
  const verifiedPickups = pickups.filter(p => p.tpc_reading != null && p.pickup_type === 'oil');

  return (
    <div>
      <TopBar title="My Orders & Bids" date="June 2026" />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FDF3E3' }}>
            <Clock size={20} style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: '#1F2A24' }}>{loading ? '—' : pending}</div>
            <div className="text-xs" style={{ color: '#5B6B63' }}>Pending Bids</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F1F8F0' }}>
            <CheckCircle2 size={20} style={{ color: '#1B5E20' }} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: '#1F2A24' }}>{loading ? '—' : accepted}</div>
            <div className="text-xs" style={{ color: '#5B6B63' }}>Accepted Orders</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FDF3E3' }}>
            <IndianRupee size={20} style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: '#1F2A24' }}>{loading ? '—' : `₹${totalValue.toLocaleString('en-IN')}`}</div>
            <div className="text-xs" style={{ color: '#5B6B63' }}>Total Bid Value</div>
          </div>
        </div>
      </div>

      {/* ── Driver Verification Status (for accepted oil bids) ── */}
      {(verifiedPickups.length > 0 || bids.some(b => b.status === 'accepted')) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F1F8F0' }}>
              <FlaskConical size={18} style={{ color: '#1B5E20' }} />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>OIL QUALITY VERIFICATION</h3>
              <p className="text-xs" style={{ color: '#5B6B63' }}>Driver TPC readings from Testo 270 device — confirms grade on pickup</p>
            </div>
          </div>

          {/* Grade legend */}
          <div className="flex gap-3 mb-4 text-xs">
            {[
              { grade: 'A', label: 'Premium', range: '< 24% TPC', color: '#1B5E20', bg: '#F1F8F0' },
              { grade: 'B', label: 'Standard', range: '24–27% TPC', color: '#D97706', bg: '#FDF3E3' },
              { grade: 'C', label: 'Basic', range: '> 27% TPC', color: '#DC2626', bg: '#FEF2F2' },
            ].map(g => (
              <div key={g.grade} className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold" style={{ background: g.bg, color: g.color }}>
                <Gauge size={11} />
                <span>Grade {g.grade} — {g.label} ({g.range})</span>
              </div>
            ))}
          </div>

          {verifiedPickups.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl text-sm" style={{ background: '#FDF3E3' }}>
              <Clock size={16} style={{ color: '#F59E0B' }} />
              <div>
                <span className="font-semibold" style={{ color: '#D97706' }}>Verification Pending</span>
                <span className="text-gray-500 ml-2">— Driver will test oil quality with Testo 270 on arrival and log the TPC% reading</span>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Pickup','Scheduled Qty','Actual Qty','TPC Reading','Verified Grade','Driver','Note'].map(h => (
                    <th key={h} className="text-left pb-3 font-medium text-xs" style={{ color: '#5B6B63' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {verifiedPickups.map((p: any) => {
                  const gs = gradeStyle[p.verified_grade] ?? { color: '#5B6B63', bg: '#F5F5F5', label: 'Unknown' };
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 font-semibold text-xs" style={{ color: '#1B5E20' }}>
                        #{p.id}
                        <div className="text-gray-400 font-normal">{new Date(p.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      </td>
                      <td className="py-3.5 text-xs" style={{ color: '#5B6B63' }}>{p.quantity}</td>
                      <td className="py-3.5 font-semibold text-xs" style={{ color: '#1F2A24' }}>
                        {p.verified_quantity ? `${p.verified_quantity} L` : '—'}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Gauge size={13} style={{ color: '#1B5E20' }} />
                          <span className="font-bold text-sm" style={{ color: '#1B5E20' }}>{p.tpc_reading}%</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">Total Polar Compounds</div>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full" style={{ color: gs.color, background: gs.bg }}>
                          <ShieldCheck size={11} /> {gs.label}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs" style={{ color: '#5B6B63' }}>{p.driver_name || '—'}</td>
                      <td className="py-3.5 text-xs max-w-[140px]" style={{ color: '#5B6B63' }}>{p.driver_note || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Oil Bids table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>MY OIL BIDS</h3>
          <Link href="/oil-exchange" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#1B5E20' }}>
            Browse listings <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
        ) : bids.length === 0 ? (
          <div className="text-center py-14">
            <ShoppingBag size={44} className="mx-auto mb-3" style={{ color: '#E5E7EB' }} />
            <p className="text-sm font-semibold text-gray-500 mb-1">No bids placed yet</p>
            <p className="text-xs text-gray-400 mb-4">Go to Oil Exchange and click "Place Bid" on any listing</p>
            <Link href="/oil-exchange" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
              <Recycle size={14} /> Browse Oil Listings
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Listing', 'Oil Type', 'Quantity', 'Grade', 'Your Bid', 'Order Value', 'Seller', 'Status', ''].map(h => (
                  <th key={h} className="text-left pb-3 font-medium text-xs" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bids.map((b: any, i: number) => {
                const st = bidStatus[b.status] || { color: '#5B6B63', bg: '#F5F5F5', label: b.status, icon: Clock };
                const Icon = st.icon;
                const orderValue = Number(b.bid_price) * Number(b.quantity_liters);
                const gs = gradeStyle[b.grade];
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 font-semibold text-xs" style={{ color: '#1B5E20' }}>{b.listing_code}</td>
                    <td className="py-3.5 text-xs" style={{ color: '#1F2A24' }}>{b.oil_type}</td>
                    <td className="py-3.5 text-xs" style={{ color: '#1F2A24' }}>{b.quantity_liters} L</td>
                    <td className="py-3.5">
                      {gs
                        ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: gs.color, background: gs.bg }}>Grade {b.grade}</span>
                        : <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">Grade {b.grade}</span>}
                    </td>
                    <td className="py-3.5 font-bold text-xs" style={{ color: '#F59E0B' }}>₹{Number(b.bid_price).toFixed(2)}/L</td>
                    <td className="py-3.5 font-semibold text-xs" style={{ color: '#1F2A24' }}>₹{orderValue.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 text-xs" style={{ color: '#5B6B63' }}>{b.seller_name}</td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>
                        <Icon size={10} /> {st.label}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => cancelBid(b.id)}
                          disabled={cancelling === b.id}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200 disabled:opacity-50"
                          style={{ color: '#DC2626', background: '#FEF2F2' }}
                        >
                          {cancelling === b.id
                            ? <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <XCircle size={10} />}
                          Cancel
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

      {/* E-Waste orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>MY E-WASTE ORDERS</h3>
          <Link href="/ewaste" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#1B5E20' }}>
            Browse e-waste <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
        ) : ewasteOrders.length === 0 ? (
          <div className="text-center py-14">
            <Cpu size={44} className="mx-auto mb-3" style={{ color: '#E5E7EB' }} />
            <p className="text-sm font-semibold text-gray-500 mb-1">No e-waste orders yet</p>
            <p className="text-xs text-gray-400 mb-4">Go to E-Waste Market and click "Buy Now"</p>
            <Link href="/ewaste" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
              <Recycle size={14} /> Browse E-Waste Listings
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Listing', 'Item', 'Category', 'Condition', 'Estimated Value', 'Seller', 'Status'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium text-xs" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ewasteOrders.map((o: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 font-semibold text-xs" style={{ color: '#1B5E20' }}>{o.listing_code}</td>
                  <td className="py-3.5 text-xs" style={{ color: '#1F2A24' }}>{o.item_name}</td>
                  <td className="py-3.5 text-xs"><span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{o.category}</span></td>
                  <td className="py-3.5 text-xs capitalize" style={{ color: '#5B6B63' }}>{o.condition}</td>
                  <td className="py-3.5 font-semibold text-xs" style={{ color: '#1F2A24' }}>₹{Number(o.ai_price_min).toLocaleString('en-IN')}–{Number(o.ai_price_max).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 text-xs" style={{ color: '#5B6B63' }}>{o.seller_name}</td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#1B5E20', background: '#F1F8F0' }}>
                      <CheckCircle2 size={10} /> Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
