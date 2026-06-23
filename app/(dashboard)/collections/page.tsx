'use client';
import { useEffect, useState } from 'react';
import { Archive, Droplets, Cpu, IndianRupee, Download, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import { jsPDF } from 'jspdf';

function downloadReceipt(h: any) {
  const date      = new Date(h.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const generated = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const type      = h.pickup_type === 'oil' ? 'Used Oil' : 'E-Waste';
  const revenue   = h.revenue ? `₹${Number(h.revenue).toLocaleString('en-IN')}` : 'N/A';
  const receiptId = `REC-${String(h.id).padStart(4, '0')}`;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;

  // Header
  pdf.setFillColor(27, 94, 32);
  pdf.rect(0, 0, W, 55, 'F');
  pdf.setFillColor(245, 158, 11);
  pdf.rect(0, 55, W, 2.5, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20); pdf.setFont('helvetica', 'bold');
  pdf.text('ReLoop', W / 2, 18, { align: 'center' });

  pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(180, 220, 180);
  pdf.text('CIRCULAR RESOURCE MANAGEMENT · COLLECTION RECEIPT', W / 2, 25, { align: 'center' });

  pdf.setFontSize(14); pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Collection Receipt', W / 2, 38, { align: 'center' });

  pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200, 230, 200);
  pdf.text(`Receipt ID: ${receiptId}`, W / 2, 46, { align: 'center' });

  // Body
  const fields = [
    ['Receipt ID',        receiptId],
    ['Collection Date',   date],
    ['Resource Type',     type],
    ['Quantity',          h.quantity || 'As recorded'],
    ['Buyer / Recycler',  h.buyer_name || 'N/A'],
    ['Revenue Earned',    revenue],
    ['Status',            (h.status || 'collected').toUpperCase()],
    ['Institution',       'Symbiosis University of Applied Sciences, Indore'],
  ];

  pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(91, 107, 99);
  pdf.text('This confirms that the following resource collection has been completed successfully.', W / 2, 72, { align: 'center' });

  const cW = 85, rH = 16, sX = 20, sY = 84;
  fields.forEach(([label, value], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = sX + col * (cW + 10), y = sY + row * rH;
    pdf.setFillColor(245, 247, 245);
    pdf.roundedRect(x, y, cW, 13, 2, 2, 'F');
    pdf.setFontSize(7); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(156, 163, 175);
    pdf.text(label.toUpperCase(), x + 4, y + 5);
    pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(31, 42, 36);
    pdf.text(String(value), x + 4, y + 10.5);
  });

  const divY = sY + Math.ceil(fields.length / 2) * rH + 8;
  pdf.setDrawColor(229, 231, 235); pdf.setLineWidth(0.5);
  pdf.line(20, divY, W - 20, divY);

  const sigY = divY + 10;
  pdf.setFillColor(241, 248, 240);
  pdf.roundedRect(20, sigY, 80, 20, 3, 3, 'F');
  pdf.setFontSize(7); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(91, 107, 99);
  pdf.text('Verified by', 24, sigY + 6);
  pdf.setFontSize(9); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(27, 94, 32);
  pdf.text('Team EcoNova · ReLoop', 24, sigY + 12);
  pdf.setFontSize(7); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(91, 107, 99);
  pdf.text(`Generated: ${generated}`, 24, sigY + 17);

  pdf.setFillColor(232, 242, 252);
  pdf.roundedRect(W - 80, sigY, 60, 20, 3, 3, 'F');
  pdf.setFontSize(7); pdf.setTextColor(33, 150, 243);
  pdf.text('Verify at: reloop.in', W - 77, sigY + 6);
  pdf.setTextColor(91, 107, 99);
  pdf.text(receiptId, W - 77, sigY + 12);
  pdf.text(`Date: ${date}`, W - 77, sigY + 17);

  pdf.setFillColor(245, 247, 245);
  pdf.rect(0, 283, W, 14, 'F');
  pdf.setFontSize(7); pdf.setTextColor(156, 163, 175);
  pdf.text('ReLoop · Symbiosis University of Applied Sciences, Indore · Green Tech Hackathon 2026', W / 2, 290, { align: 'center' });
  pdf.text(`Generated on ${generated}`, W / 2, 294, { align: 'center' });

  pdf.save(`${receiptId}-Collection-Receipt.pdf`);
}

function exportCSV(history: any[]) {
  const header = ['Date', 'Type', 'Quantity', 'Revenue (INR)', 'Buyer/Recycler', 'Status'];
  const rows = history.map(h => [
    new Date(h.scheduled_date).toLocaleDateString('en-IN'),
    h.pickup_type === 'oil' ? 'Used Oil' : 'E-Waste',
    h.quantity || '',
    h.revenue || '',
    h.buyer_name || '',
    h.status || '',
  ]);
  const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'ReLoop-Collection-History.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function CollectionsPage() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dlId, setDlId]       = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/collections').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const history = data?.history || [];
  const stats   = data?.stats   || {};
  const chart   = (data?.chart  || []).map((r: any) => ({ ...r, oil: Number(r.oil || 0), ewaste: Number(r.ewaste || 0) }));

  const handleDownload = (h: any) => {
    setDlId(h.id);
    setTimeout(() => { downloadReceipt(h); setDlId(null); }, 300);
  };

  return (
    <div>
      <TopBar title="My Collections" date="June 2026" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Total Collections"    value={String(stats.total || 0)}                                      change="All time"   changeType="info" icon={Archive}      color="green" />
        <StatCard label="Oil Collected (Total)" value={`${Number(stats.total_oil || 0).toFixed(0)}`}   unit="L"      change="+12% MoM"  changeType="up"   icon={Droplets}     color="blue"  />
        <StatCard label="E-Waste Pickups"       value={String(stats.total_ewaste_pickups || 0)}                       change="Completed"  changeType="info" icon={Cpu}          color="amber" />
        <StatCard label="Total Revenue"         value={`₹${Number(stats.total_revenue || 0).toLocaleString('en-IN')}`} change="+22% MoM" changeType="up"   icon={IndianRupee}  color="green" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>COLLECTION HISTORY</h3>
          <button onClick={() => exportCSV(history)} disabled={loading || history.length === 0}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 font-semibold disabled:opacity-40 transition-opacity"
            style={{ color: '#5B6B63' }}>
            <Download size={12} /> Export CSV
          </button>
        </div>
        {loading ? <div className="text-sm text-gray-400 text-center py-6">Loading...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date','Type','Quantity','Revenue','Buyer','Status','Receipt'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium text-xs" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h: any) => (
                <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>
                    {new Date(h.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      {h.pickup_type === 'oil' ? <Droplets size={13} style={{ color: '#F59E0B' }} /> : <Cpu size={13} style={{ color: '#2196F3' }} />}
                      {h.pickup_type === 'oil' ? 'Used Oil' : 'E-Waste'}
                    </span>
                  </td>
                  <td className="py-3 text-sm" style={{ color: '#1F2A24' }}>{h.quantity || '—'}</td>
                  <td className="py-3 font-semibold" style={{ color: '#1B5E20' }}>
                    {h.revenue ? `₹${Number(h.revenue).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{h.buyer_name || '—'}</td>
                  <td className="py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: '#1B5E20', background: '#F1F8F0' }}>{h.status}</span>
                  </td>
                  <td className="py-3">
                    <button onClick={() => handleDownload(h)} disabled={dlId === h.id}
                      className="flex items-center gap-1 text-xs font-semibold hover:underline disabled:opacity-50"
                      style={{ color: '#2196F3' }}>
                      {dlId === h.id ? <><Loader2 size={11} className="animate-spin" /> Preparing...</> : <><Download size={12} /> PDF</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>REVENUE — OIL vs E-WASTE (2026)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chart} barCategoryGap="25%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5B6B63', fontSize: 12 }} tickFormatter={(v: number) => `₹${v / 1000}K`} />
            <Tooltip formatter={(v: number, name: string) => [`₹${Number(v).toLocaleString('en-IN')}`, name === 'oil' ? 'Used Oil' : 'E-Waste']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Bar dataKey="oil"    fill="#F59E0B" radius={[4, 4, 0, 0]} name="oil"    />
            <Bar dataKey="ewaste" fill="#1B5E20" radius={[4, 4, 0, 0]} name="ewaste" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} /><span className="text-xs" style={{ color: '#5B6B63' }}>Used Oil Revenue</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#1B5E20' }} /><span className="text-xs" style={{ color: '#5B6B63' }}>E-Waste Revenue</span></div>
        </div>
      </div>
    </div>
  );
}
