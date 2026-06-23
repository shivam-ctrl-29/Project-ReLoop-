'use client';
import { useEffect, useState } from 'react';
import { 
  Recycle, Cpu, Clock, CheckCircle2, XCircle, IndianRupee, AlertCircle, 
  ShieldCheck, ShieldAlert 
} from 'lucide-react';
import TopBar from '../../components/TopBar';

const bidStatusStyle: Record<string, { color: string; bg: string; label: string }> = {
  pending:  { color: '#D97706', bg: 'bg-amber-100/50', label: 'Pending' },
  accepted: { color: '#059669', bg: 'bg-emerald-100/50', label: 'Accepted' },
  rejected: { color: '#DC2626', bg: 'bg-red-100/50', label: 'Rejected' },
};

export default function SellerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'bids' | 'oil' | 'ewaste'>('bids');
  const [actioning, setActioning] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/seller').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleTabChange = (newTab: 'bids' | 'oil' | 'ewaste') => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setTab(newTab));
    } else {
      setTab(newTab);
    }
  };

  const handleBidAction = async (bidId: number, action: 'accept' | 'reject') => {
    setActioning(bidId);
    await fetch('/api/seller', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bid_id: bidId, action }),
    });
    setActioning(null);
    load();
  };

  const stats = data?.stats ?? {};
  const oilBids: any[] = data?.oilBids ?? [];
  const oilListings: any[] = data?.oilListings ?? [];
  const ewasteListings: any[] = data?.ewasteListings ?? [];

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="Seller Portal" date="June 2026" />

      {/* Stats - Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-6">
        {[
          { label: 'Active Oil Listings', value: loading ? '—' : stats.active_oil, icon: Recycle, gradient: 'from-emerald-400 to-green-600' },
          { label: 'Active E-Waste', value: loading ? '—' : stats.active_ewaste, icon: Cpu, gradient: 'from-blue-400 to-indigo-600' },
          { label: 'Pending Bids', value: loading ? '—' : stats.pending_bids, icon: Clock, gradient: 'from-amber-400 to-orange-500' },
          { label: 'Accepted Deals', value: loading ? '—' : stats.accepted_bids, icon: CheckCircle2, gradient: 'from-teal-400 to-emerald-600' },
        ].map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className="relative overflow-hidden rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl border border-white/60 transition-transform duration-300 hover:-translate-y-1 group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity`} />
            <div className="flex items-center gap-5 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradient} shadow-inner text-white`}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</div>
                <div className="text-sm font-medium text-slate-500 mt-1">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 p-2 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 w-fit">
          {([
            { key: 'bids', label: 'Incoming Bids', icon: IndianRupee },
            { key: 'oil', label: 'Oil Listings', icon: Recycle },
            { key: 'ewaste', label: 'E-Waste Listings', icon: Cpu },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative ${
                tab === key ? 'text-white shadow-md' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
              }`}
              style={tab === key ? { background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' } : {}}>
              <Icon size={16} /> 
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6" style={{ viewTransitionName: 'tab-content' }}>
        {/* Incoming Bids */}
        {tab === 'bids' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-extrabold text-xl text-slate-800 tracking-tight">Bids on Your Listings</h3>
              <div className="px-4 py-1.5 rounded-full bg-emerald-100/50 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={14} /> Compliance Verified Supported
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : oilBids.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-slate-100/50 border-dashed">
                <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-base font-bold text-slate-600 mb-1">No bids received yet</p>
                <p className="text-sm text-slate-400">Buyers will place bids on your oil listings from the Exchange.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-200/60 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-4 pl-4">Listing</th>
                      <th className="pb-4">Oil Details</th>
                      <th className="pb-4">Order Value</th>
                      <th className="pb-4">Buyer Status</th>
                      <th className="pb-4">Received</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {oilBids.map((b: any) => {
                      const st = bidStatusStyle[b.bid_status] ?? { color: '#64748B', bg: 'bg-slate-100', label: b.bid_status };
                      const orderValue = Number(b.bid_price) * Number(b.quantity_liters);
                      const isPending = b.bid_status === 'pending';
                      return (
                        <tr key={b.bid_id} className="group hover:bg-white/60 transition-colors duration-200">
                          <td className="py-5 pl-4">
                            <div className="font-bold text-emerald-700 bg-emerald-50 w-fit px-2.5 py-1 rounded-md">{b.listing_code}</div>
                          </td>
                          <td className="py-5">
                            <div className="font-bold text-slate-800">{b.oil_type}</div>
                            <div className="text-xs text-slate-500 font-medium">{b.quantity_liters}L • Grade {b.grade}</div>
                          </td>
                          <td className="py-5">
                            <div className="font-bold text-slate-800 text-base">₹{orderValue.toLocaleString('en-IN')}</div>
                            <div className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded w-fit mt-1">₹{Number(b.bid_price).toFixed(2)}/L</div>
                          </td>
                          <td className="py-5">
                            <div className="font-bold text-slate-800">{b.buyer_name}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {b.buyer_verified ? (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                  <ShieldCheck size={12} /> Verified Buyer
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                  <ShieldAlert size={12} /> Unverified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-5 text-slate-500 font-medium">
                            {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-5">
                            <span className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${st.bg}`}
                              style={{ color: st.color }}>
                              {st.label}
                            </span>
                          </td>
                          <td className="py-5 pr-4">
                            {isPending ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleBidAction(b.bid_id, 'accept')}
                                  disabled={actioning === b.bid_id || !b.buyer_verified}
                                  title={!b.buyer_verified ? "Cannot accept bids from unverified buyers" : "Accept bid"}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none bg-gradient-to-r from-emerald-500 to-green-600">
                                  <CheckCircle2 size={14} /> Accept
                                </button>
                                <button
                                  onClick={() => handleBidAction(b.bid_id, 'reject')}
                                  disabled={actioning === b.bid_id}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 transition-all hover:bg-rose-100 disabled:opacity-50">
                                  <XCircle size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Actioned</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Oil Listings */}
        {tab === 'oil' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8">
            <h3 className="font-extrabold text-xl text-slate-800 tracking-tight mb-8">My Oil Listings</h3>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : oilListings.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-slate-100/50 border-dashed">
                <Recycle size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-base font-bold text-slate-600">No oil listings yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {oilListings.map((l: any, i: number) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-black text-slate-800 text-lg">{l.oil_type}</div>
                        <div className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded w-fit mt-1">{l.listing_code}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full ${
                        l.status === 'active' ? 'text-emerald-700 bg-emerald-100/50' : 'text-blue-700 bg-blue-100/50'
                      }`}>{l.status}</span>
                    </div>
                    
                    <div className="flex gap-4 mb-5">
                      <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Volume</div>
                        <div className="font-bold text-slate-700">{l.quantity_liters}L</div>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Grade</div>
                        <div className="font-bold text-slate-700">{l.grade}</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Est. Price Range</div>
                        <div className="font-bold text-slate-800">₹{l.ai_price_min} - ₹{l.ai_price_max}/L</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Bids</div>
                        <div className="font-black text-amber-500 text-lg">{l.bid_count}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* E-Waste Listings */}
        {tab === 'ewaste' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8">
            <h3 className="font-extrabold text-xl text-slate-800 tracking-tight mb-8">My E-Waste Listings</h3>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : ewasteListings.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-slate-100/50 border-dashed">
                <Cpu size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-base font-bold text-slate-600">No e-waste listings yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ewasteListings.map((l: any, i: number) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="pr-2">
                        <div className="font-black text-slate-800 text-lg line-clamp-1">{l.item_name}</div>
                        <div className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-0.5 rounded w-fit mt-1">{l.listing_code}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full ${
                        l.status === 'listed' ? 'text-emerald-700 bg-emerald-100/50' : 'text-slate-700 bg-slate-100/50'
                      }`}>{l.status}</span>
                    </div>
                    
                    <div className="flex gap-2 mb-5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{l.category}</span>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{l.brand}</span>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{l.condition}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">AI Recommendation</div>
                        <div className={`font-bold text-sm capitalize ${
                          l.ai_triage === 'recycle' ? 'text-emerald-600' :
                          l.ai_triage === 'resell' ? 'text-blue-600' : 'text-amber-600'
                        }`}>{l.ai_triage}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Est. Value</div>
                        <div className="font-black text-slate-800">₹{l.ai_price_min} - ₹{l.ai_price_max}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
