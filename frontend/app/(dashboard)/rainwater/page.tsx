'use client';
import { useEffect, useState } from 'react';
import { CloudRain, Droplets, IndianRupee, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import AlertBanner from '../../components/AlertBanner';

const forecastData = [
  { month: 'Jul', forecast: 180 }, { month: 'Aug', forecast: 240 },
  { month: 'Sep', forecast: 210 }, { month: 'Oct', forecast: 95 },
  { month: 'Nov', forecast: 30  }, { month: 'Dec', forecast: 10  },
];

export default function RainwaterPage() {
  const [apiData, setApiData] = useState<any>(null);
  const [area,    setArea]    = useState(2400);
  const [rain,    setRain]    = useState(180);
  const [runoff,  setRunoff]  = useState(0.85);

  useEffect(() => {
    fetch('/api/rainwater').then(r => r.json()).then(setApiData).catch(() => {});
  }, []);

  const scrollToForecast = () =>
    document.getElementById('forecast-chart')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const rawHarvested = area * rain * runoff;
  const harvested  = rawHarvested.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const tankRec = (Math.ceil((rawHarvested * 0.25) / 1000) * 1000).toLocaleString('en-IN');
  const flushes = Math.floor(rawHarvested / 6).toLocaleString('en-IN');
  const landscape = Math.floor(rawHarvested / 10).toLocaleString('en-IN');
  const cooling = Math.floor(rawHarvested / 15).toLocaleString('en-IN');
  const floorWash = Math.floor(rawHarvested / 2).toLocaleString('en-IN');
  const vehicles = Math.floor(rawHarvested / 100).toLocaleString('en-IN');

  const buildings  = apiData?.buildings  || [];
  const chartData  = apiData?.rainfall   || [];
  const stats      = apiData?.stats      || {};
  const waterSaved = Number(stats.water_saved_liters || 9200);

  return (
    <div>
      <TopBar title="Rainwater AI" date="June 2026" />
      <AlertBanner message="Monsoon season approaching — high harvest potential in Jul–Sep" action="View Forecast" onAction={scrollToForecast} />

      <div className="flex gap-4 mb-6">
        <StatCard label="Water Saved This Month" value={(waterSaved/1000).toFixed(1)} unit="K L" change="+34%" changeType="up" icon={Droplets} color="blue" />
        <StatCard label="Harvest Potential (Jul)" value="4,200" unit="L" change="Forecast" changeType="info" icon={CloudRain} color="green" />
        <StatCard label="Municipal Water Saved"   value={`₹${(waterSaved * 2).toLocaleString('en-IN')}`} change="+28%" changeType="up" icon={IndianRupee} color="amber" />
        <StatCard label="Forecast Accuracy"       value="91" unit="%" change="Stable" changeType="stable" icon={TrendingUp} color="blue" />
      </div>

      <div className="flex gap-5 mb-6">
        {/* Forecast Chart */}
        <div id="forecast-chart" className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>RAINFALL FORECAST — PROPHET MODEL (H2 2026)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={v => `${v}mm`} />
              <Tooltip formatter={(v: any) => [`${v} mm`, 'Forecast']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Area type="monotone" dataKey="forecast" stroke="#2196F3" fill="#E8F2FC" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Live Calculator */}
        <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>HARVEST CALCULATOR</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Catchment Area (m²)</label>
              <input type="number" value={area} onChange={e => setArea(Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Rainfall (mm)</label>
              <input type="number" value={rain} onChange={e => setRain(Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: '#5B6B63' }}>Runoff Coefficient</label>
              <input type="number" value={runoff} onChange={e => setRunoff(Number(e.target.value))} step={0.01} min={0} max={1}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" />
            </div>
            <div className="rounded-xl p-3" style={{ background: '#E8F2FC' }}>
              <div className="text-xs mb-1" style={{ color: '#5B6B63' }}>Total Water Collected</div>
              <div className="text-xl font-bold transition-all" style={{ color: '#2196F3', fontFamily: 'Georgia, serif' }}>{harvested} L</div>
              <div className="text-xs mt-1" style={{ color: '#5B6B63' }}>Estimated harvestable this month</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI RECOMMENDATIONS - FULL WIDTH */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-base mb-5" style={{ color: '#1F2A24' }}>AI RECOMMENDATIONS: EFFICIENT USAGE & STORAGE</h3>
        
        <div className="grid grid-cols-5 gap-5">
          <div className="p-4 rounded-xl col-span-5 md:col-span-1 border border-green-100" style={{ background: '#F1F8F0' }}>
            <div className="text-xs font-bold mb-1 uppercase" style={{ color: '#1B5E20' }}>Optimal Tank Size</div>
            <div className="text-2xl font-bold mb-2" style={{ color: '#1F2A24' }}>{tankRec} <span className="text-sm font-medium">L</span></div>
            <div className="text-xs text-gray-600">Includes a 25% safety buffer for peak monsoon downpours.</div>
          </div>
          
          <div className="col-span-5 md:col-span-4 grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col justify-center">
              <div className="text-lg mb-1">🚽</div>
              <div className="text-xs font-medium text-gray-500 mb-0.5">Toilet Flushing</div>
              <div className="text-lg font-bold" style={{ color: '#2196F3' }}>{flushes} <span className="text-xs font-medium text-gray-500">uses</span></div>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col justify-center">
              <div className="text-lg mb-1">🌱</div>
              <div className="text-xs font-medium text-gray-500 mb-0.5">Landscaping</div>
              <div className="text-lg font-bold" style={{ color: '#2196F3' }}>{landscape} <span className="text-xs font-medium text-gray-500">m² coverage</span></div>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col justify-center">
              <div className="text-lg mb-1">❄️</div>
              <div className="text-xs font-medium text-gray-500 mb-0.5">Cooling Towers</div>
              <div className="text-lg font-bold" style={{ color: '#2196F3' }}>{cooling} <span className="text-xs font-medium text-gray-500">hrs runtime</span></div>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col justify-center">
              <div className="text-lg mb-1">🧹</div>
              <div className="text-xs font-medium text-gray-500 mb-0.5">Floor Washing</div>
              <div className="text-lg font-bold" style={{ color: '#2196F3' }}>{floorWash} <span className="text-xs font-medium text-gray-500">m² area</span></div>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col justify-center">
              <div className="text-lg mb-1">🚌</div>
              <div className="text-xs font-medium text-gray-500 mb-0.5">Vehicle Washing</div>
              <div className="text-lg font-bold" style={{ color: '#2196F3' }}>{vehicles} <span className="text-xs font-medium text-gray-500">campus buses</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Buildings Table */}
      <div className="flex gap-5 mb-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>CAMPUS BUILDINGS — HARVEST POTENTIAL</h3>
          {buildings.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-6">Loading buildings...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Building', 'Roof Area', 'Runoff Coeff.', 'Monthly Potential'].map(h => (
                    <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buildings.map((b: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium" style={{ color: '#1F2A24' }}>{b.name}</td>
                    <td className="py-3" style={{ color: '#5B6B63' }}>{b.catchment_area_m2} m²</td>
                    <td className="py-3" style={{ color: '#5B6B63' }}>{b.runoff_coefficient}</td>
                    <td className="py-3 font-semibold" style={{ color: '#2196F3' }}>
                      {Number(b.monthly_potential).toLocaleString('en-IN')} L/mo
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>HARVESTED — 2026</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData.length ? chartData : [{ month: 'No data', harvested: 0 }]} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 11 }} tickFormatter={v => `${v}K`} />
              <Tooltip formatter={(v: any) => [`${v}K L`, 'Harvested']} contentStyle={{ borderRadius: 8 }} />
              <Bar dataKey="harvested" fill="#2196F3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
