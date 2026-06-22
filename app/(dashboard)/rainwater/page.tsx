'use client';
import { CloudRain, Droplets, IndianRupee, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import AlertBanner from '../../components/AlertBanner';

const forecastData = [
  { month: 'Jul', forecast: 180, actual: 0 },
  { month: 'Aug', forecast: 240, actual: 0 },
  { month: 'Sep', forecast: 210, actual: 0 },
  { month: 'Oct', forecast: 95, actual: 0 },
  { month: 'Nov', forecast: 30, actual: 0 },
  { month: 'Dec', forecast: 10, actual: 0 },
];

const harvestData = [
  { month: 'Jan', harvested: 0 }, { month: 'Feb', harvested: 0 },
  { month: 'Mar', harvested: 12 }, { month: 'Apr', harvested: 28 },
  { month: 'May', harvested: 65 }, { month: 'Jun', harvested: 92 },
];

const buildings = [
  { name: 'Main Academic Block', area: '2,400 m²', runoff: 0.85, potential: '4,200 L/month' },
  { name: 'Hostel Block A',       area: '1,800 m²', runoff: 0.80, potential: '3,100 L/month' },
  { name: 'Sports Complex',       area: '3,200 m²', runoff: 0.75, potential: '5,100 L/month' },
  { name: 'Admin Building',       area: '900 m²',  runoff: 0.85, potential: '1,600 L/month' },
];

export default function RainwaterPage() {
  return (
    <div>
      <TopBar title="Rainwater AI" date="June 2026" />
      <AlertBanner message="Monsoon season approaching — high harvest potential in Jul–Sep" action="View Forecast" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Water Saved This Month" value="9.2" unit="K L" change="+34%" changeType="up" icon={Droplets} color="blue" />
        <StatCard label="Harvest Potential (Jul)" value="4,200" unit="L" change="Forecast" changeType="info" icon={CloudRain} color="green" />
        <StatCard label="Municipal Water Saved" value="₹18,400" change="+28%" changeType="up" icon={IndianRupee} color="amber" />
        <StatCard label="Forecast Accuracy" value="91" unit="%" change="Stable" changeType="stable" icon={TrendingUp} color="blue" />
      </div>

      <div className="flex gap-5 mb-6">
        {/* Forecast Chart */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>RAINFALL FORECAST — PROPHET MODEL (H2 2026)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={v => `${v}mm`} />
              <Tooltip formatter={(v: number) => [`${v} mm`, 'Forecast']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Area type="monotone" dataKey="forecast" stroke="#2196F3" fill="#E8F2FC" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Calculator */}
        <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>HARVEST CALCULATOR</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Catchment Area (m²)</label>
              <input type="number" defaultValue={2400} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Rainfall (mm)</label>
              <input type="number" defaultValue={180} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Runoff Coefficient</label>
              <input type="number" defaultValue={0.85} step={0.01} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            </div>
            <div className="rounded-xl p-3" style={{ background: '#E8F2FC' }}>
              <div className="text-xs mb-1" style={{ color: '#5B6B63' }}>Formula: Area × Rainfall × Runoff</div>
              <div className="text-xl font-bold" style={{ color: '#2196F3', fontFamily: 'Georgia, serif' }}>367,200 L</div>
              <div className="text-xs mt-1" style={{ color: '#5B6B63' }}>Estimated harvestable this month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Buildings Table */}
      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>CAMPUS BUILDINGS — HARVEST POTENTIAL</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Building', 'Roof Area', 'Runoff Coeff.', 'Monthly Potential'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buildings.map((b, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 font-medium" style={{ color: '#1F2A24' }}>{b.name}</td>
                  <td className="py-3" style={{ color: '#5B6B63' }}>{b.area}</td>
                  <td className="py-3" style={{ color: '#5B6B63' }}>{b.runoff}</td>
                  <td className="py-3 font-semibold" style={{ color: '#2196F3' }}>{b.potential}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>HARVESTED — 2026</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={harvestData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 11 }} tickFormatter={v => `${v}K`} />
              <Tooltip formatter={(v: number) => [`${v}K L`, 'Harvested']} contentStyle={{ borderRadius: 8 }} />
              <Bar dataKey="harvested" fill="#2196F3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
