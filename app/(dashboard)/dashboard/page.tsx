'use client';
import { Droplets, IndianRupee, Wind, ShieldCheck, Truck, FileDown, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import AlertBanner from '../../components/AlertBanner';

const pickups = [
  { date: '18 Jun', qty: '120 L', status: 'Collected', statusColor: '#1B5E20', statusBg: '#F1F8F0', action: 'Certificate', actionColor: '#1B5E20' },
  { date: '24 Jun', qty: '80 L',  status: 'Scheduled', statusColor: '#F59E0B', statusBg: '#FDF3E3', action: 'Details',     actionColor: '#2196F3' },
  { date: '30 Jun', qty: '—',     status: 'Requested', statusColor: '#2196F3', statusBg: '#E8F2FC', action: 'Cancel',      actionColor: '#DC2626' },
];

const chartData = [
  { month: 'JAN', val: 310 },
  { month: 'FEB', val: 275 },
  { month: 'MAR', val: 340 },
  { month: 'APR', val: 290 },
  { month: 'MAY', val: 320 },
  { month: 'JUN', val: 340 },
];

const quickActions = [
  { icon: Truck,    label: 'Schedule a Pickup',    sub: "We'll collect your used oil" },
  { icon: FileDown, label: 'Download Certificate',  sub: 'For FSSAI records' },
  { icon: History,  label: 'Collection History',    sub: 'All past pickups' },
];

export default function DashboardPage() {
  return (
    <div>
      <TopBar title="Dashboard" date="June 2026" />
      <AlertBanner
        message="Pickup routes in Indore may be delayed Monday due to heavy rainfall"
        action="Check Schedule"
      />

      {/* Stat Cards */}
      <div className="flex gap-4 mb-6">
        <StatCard label="Oil Collected This Month" value="340" unit="kg" change="+12%" changeType="up" icon={Droplets} color="green" />
        <StatCard label="Earnings from Oil" value="₹14,200" change="+8%" changeType="up" icon={IndianRupee} color="amber" />
        <StatCard label="CO2 Saved" value="2.4" unit="T" change="Stable" changeType="stable" icon={Wind} color="blue" />
        <StatCard label="Compliance Docs Ready" value="3" change="Updated" changeType="info" icon={ShieldCheck} color="green" />
      </div>

      {/* Pickups + Quick Actions */}
      <div className="flex gap-5 mb-6">
        {/* Pickups Table */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>MY PICKUPS</h3>
            <button className="text-sm font-medium" style={{ color: '#1B5E20' }}>View All</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>Date</th>
                <th className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>Quantity</th>
                <th className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>Status</th>
                <th className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map((p, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3.5" style={{ color: '#1F2A24' }}>{p.date}</td>
                  <td className="py-3.5" style={{ color: '#1F2A24' }}>{p.qty}</td>
                  <td className="py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: p.statusColor, background: p.statusBg }}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <button className="text-xs font-semibold" style={{ color: p.actionColor }}>
                      {p.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>WHAT DO YOU WANT TO DO?</h3>
          <div className="space-y-3">
            {quickActions.map(({ icon: Icon, label, sub }, i) => (
              <button key={i} className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-left transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F1F8F0' }}>
                  <Icon size={16} style={{ color: '#1B5E20' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#1F2A24' }}>{label}</div>
                  <div className="text-xs" style={{ color: '#5B6B63' }}>{sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>OIL COLLECTED (LITRES) — 2026</h3>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#1B5E20' }}></div>
            <span className="text-xs" style={{ color: '#5B6B63' }}>Monthly Collection</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={v => `${v}L`} />
            <Tooltip formatter={(v: number) => [`${v} L`, 'Collected']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Bar dataKey="val" fill="#1B5E20" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
