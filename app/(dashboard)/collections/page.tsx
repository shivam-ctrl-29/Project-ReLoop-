'use client';
import { Archive, Droplets, Cpu, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';

const history = [
  { date: '18 Jun 2026', type: 'Used Oil', qty: '120 L', grade: 'A', revenue: '₹3,600', buyer: 'GreenFuel Indore', status: 'Completed', cert: true },
  { date: '12 Jun 2026', type: 'E-Waste',  qty: '8 items', grade: '—', revenue: '₹22,000', buyer: 'TechRecycle MP', status: 'Completed', cert: true },
  { date: '05 Jun 2026', type: 'Used Oil', qty: '85 L',  grade: 'B', revenue: '₹1,870', buyer: 'BioDiesel Co.',  status: 'Completed', cert: true },
  { date: '28 May 2026', type: 'E-Waste',  qty: '3 items', grade: '—', revenue: '₹8,500', buyer: 'E-Cycle Hub',   status: 'Completed', cert: true },
  { date: '20 May 2026', type: 'Used Oil', qty: '200 L', grade: 'A', revenue: '₹6,000', buyer: 'GreenFuel Indore', status: 'Completed', cert: true },
  { date: '14 May 2026', type: 'E-Waste',  qty: '12 items', grade: '—', revenue: '₹34,000', buyer: 'TechRecycle MP', status: 'Completed', cert: true },
];

const monthlyData = [
  { month: 'Jan', oil: 280, ewaste: 12000 },
  { month: 'Feb', oil: 320, ewaste: 18000 },
  { month: 'Mar', oil: 290, ewaste: 22000 },
  { month: 'Apr', oil: 410, ewaste: 28000 },
  { month: 'May', oil: 485, ewaste: 42500 },
  { month: 'Jun', oil: 405, ewaste: 30500 },
];

export default function CollectionsPage() {
  return (
    <div>
      <TopBar title="My Collections" date="June 2026" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Total Collections" value="24" change="All time" changeType="info" icon={Archive} color="green" />
        <StatCard label="Oil Collected (Total)" value="2,190" unit="L" change="+12% MoM" changeType="up" icon={Droplets} color="blue" />
        <StatCard label="E-Waste Items" value="63" change="+7 this month" changeType="up" icon={Cpu} color="amber" />
        <StatCard label="Total Revenue" value="₹1,24,000" change="+22% MoM" changeType="up" icon={IndianRupee} color="green" />
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>COLLECTION HISTORY</h3>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" style={{ color: '#5B6B63' }}>Filter</button>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" style={{ color: '#5B6B63' }}>Export CSV</button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date', 'Type', 'Quantity', 'Grade', 'Revenue', 'Buyer', 'Status', 'Cert'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{h.date}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      {h.type === 'Used Oil' ? <Droplets size={13} style={{ color: '#F59E0B' }} /> : <Cpu size={13} style={{ color: '#2196F3' }} />}
                      {h.type}
                    </span>
                  </td>
                  <td className="py-3" style={{ color: '#1F2A24' }}>{h.qty}</td>
                  <td className="py-3"><span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{h.grade}</span></td>
                  <td className="py-3 font-semibold" style={{ color: '#1B5E20' }}>{h.revenue}</td>
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{h.buyer}</td>
                  <td className="py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#1B5E20', background: '#F1F8F0' }}>{h.status}</span>
                  </td>
                  <td className="py-3">
                    {h.cert && <button className="text-xs font-semibold" style={{ color: '#2196F3' }}>Download</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>REVENUE BREAKDOWN — OIL vs E-WASTE (2026)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} barCategoryGap="25%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={v => `₹${v/1000}K`} />
            <Tooltip formatter={(v: number, name: string) => [`₹${v.toLocaleString()}`, name === 'oil' ? 'Used Oil' : 'E-Waste']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Bar dataKey="oil" fill="#F59E0B" radius={[4, 4, 0, 0]} name="oil" />
            <Bar dataKey="ewaste" fill="#1B5E20" radius={[4, 4, 0, 0]} name="ewaste" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }}></div><span className="text-xs" style={{ color: '#5B6B63' }}>Used Oil Revenue</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#1B5E20' }}></div><span className="text-xs" style={{ color: '#5B6B63' }}>E-Waste Revenue</span></div>
        </div>
      </div>
    </div>
  );
}
