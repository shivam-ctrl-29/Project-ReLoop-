'use client';
import { useEffect, useState } from 'react';
import { ShoppingBag, Recycle, Clock, CheckCircle2, XCircle, IndianRupee, ArrowRight } from 'lucide-react';
import TopBar from '../../components/TopBar';
import Link from 'next/link';

const bidStatus: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  pending:  { color: '#F59E0B', bg: '#FDF3E3', label: 'Pending',  icon: Clock },
  accepted: { color: '#1B5E20', bg: '#F1F8F0', label: 'Accepted', icon: CheckCircle2 },
  rejected: { color: '#DC2626', bg: '#FEF2F2', label: 'Rejected', icon: XCircle },
};

export default function OrdersPage() {
  const [bids, setBids]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/oil/bids').then(r => r.json()).then(d => {
      setBids(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const pending  = bids.filter(b => b.status === 'pending').length;
  const accepted = bids.filter(b => b.status === 'accepted').length;
  const totalValue = bids.reduce((s, b) => s + Number(b.bid_price) * Number(b.quantity_liters), 0);

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

      {/* Bids table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>MY OIL BIDS</h3>
          <Link href="/oil-exchange"
            className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#1B5E20' }}>
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
            <Link href="/oil-exchange"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#1B5E20' }}>
              <Recycle size={14} /> Browse Oil Listings
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Listing', 'Oil Type', 'Quantity', 'Grade', 'Your Bid', 'Order Value', 'Seller', 'Status'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium text-xs" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bids.map((b: any, i: number) => {
                const st = bidStatus[b.status] || { color: '#5B6B63', bg: '#F5F5F5', label: b.status, icon: Clock };
                const Icon = st.icon;
                const orderValue = Number(b.bid_price) * Number(b.quantity_liters);
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 font-semibold text-xs" style={{ color: '#1B5E20' }}>{b.listing_code}</td>
                    <td className="py-3.5 text-xs" style={{ color: '#1F2A24' }}>{b.oil_type}</td>
                    <td className="py-3.5 text-xs" style={{ color: '#1F2A24' }}>{b.quantity_liters} L</td>
                    <td className="py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">Grade {b.grade}</span>
                    </td>
                    <td className="py-3.5 font-bold text-xs" style={{ color: '#F59E0B' }}>₹{Number(b.bid_price).toFixed(2)}/L</td>
                    <td className="py-3.5 font-semibold text-xs" style={{ color: '#1F2A24' }}>₹{orderValue.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 text-xs" style={{ color: '#5B6B63' }}>{b.seller_name}</td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: st.color, background: st.bg }}>
                        <Icon size={10} /> {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
