'use client';
import { FileText, ShieldCheck, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';

const docs = [
  { id: 'CERT-001', name: 'FSSAI Oil Disposal Certificate', date: '18 Jun 2026', qty: '120 L', buyer: 'GreenFuel Indore', status: 'Valid', expires: '18 Jun 2027' },
  { id: 'CERT-002', name: 'FSSAI Oil Disposal Certificate', date: '05 Jun 2026', qty: '85 L',  buyer: 'BioDiesel Co.',   status: 'Valid', expires: '05 Jun 2027' },
  { id: 'CERT-003', name: 'E-Waste Recycler Authorization', date: '12 Jun 2026', qty: '8 items', buyer: 'TechRecycle MP', status: 'Valid', expires: '12 Jun 2027' },
  { id: 'CERT-004', name: 'CPCB Recycling Certificate',    date: '28 May 2026', qty: '3 items', buyer: 'E-Cycle Hub',   status: 'Valid', expires: '28 May 2027' },
  { id: 'CERT-005', name: 'FSSAI Oil Disposal Certificate', date: '20 May 2026', qty: '200 L', buyer: 'GreenFuel Indore', status: 'Valid', expires: '20 May 2027' },
];

const compliance = [
  { name: 'FSSAI Compliance',             status: 'Compliant', detail: 'All oil disposals certified', icon: CheckCircle2, color: '#1B5E20', bg: '#F1F8F0' },
  { name: 'E-Waste Management Rules 2022', status: 'Compliant', detail: 'CPCB recyclers used only',   icon: CheckCircle2, color: '#1B5E20', bg: '#F1F8F0' },
  { name: 'NAAC Green Campus Metrics',     status: 'On Track',  detail: '3 of 5 SDGs tracked',       icon: AlertCircle,  color: '#F59E0B', bg: '#FDF3E3' },
  { name: 'CSR/ESG Annual Report',         status: 'Due Oct',   detail: 'Q3 data being collected',   icon: AlertCircle,  color: '#2196F3', bg: '#E8F2FC' },
];

export default function CompliancePage() {
  return (
    <div>
      <TopBar title="Compliance Docs" date="June 2026" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Certificates Ready" value="3" change="This month" changeType="info" icon={FileText} color="green" />
        <StatCard label="Total Docs Generated" value="24" change="All time" changeType="info" icon={ShieldCheck} color="amber" />
        <StatCard label="Compliance Score" value="96" unit="%" change="Excellent" changeType="up" icon={CheckCircle2} color="green" />
        <StatCard label="Next Report Due" value="Oct" unit="2026" change="CSR/ESG" changeType="info" icon={FileText} color="blue" />
      </div>

      {/* Compliance Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>COMPLIANCE STATUS</h3>
        <div className="grid grid-cols-4 gap-4">
          {compliance.map(({ name, status, detail, icon: Icon, color, bg }) => (
            <div key={name} className="p-4 rounded-xl" style={{ background: bg }}>
              <Icon size={20} style={{ color }} className="mb-2" />
              <div className="text-sm font-semibold mb-1" style={{ color: '#1F2A24' }}>{name}</div>
              <div className="text-xs font-semibold mb-1" style={{ color }}>{status}</div>
              <div className="text-xs" style={{ color: '#5B6B63' }}>{detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>CERTIFICATES & DOCUMENTS</h3>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" style={{ color: '#5B6B63' }}>Filter by Type</button>
            <button className="text-xs px-4 py-1.5 rounded-lg font-semibold text-white" style={{ background: '#1B5E20' }}>Export All</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Doc ID', 'Certificate Name', 'Issued', 'Quantity', 'Buyer / Recycler', 'Status', 'Expires', 'Action'].map(h => (
                <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-semibold text-xs" style={{ color: '#1B5E20' }}>{d.id}</td>
                <td className="py-3" style={{ color: '#1F2A24' }}>{d.name}</td>
                <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{d.date}</td>
                <td className="py-3" style={{ color: '#5B6B63' }}>{d.qty}</td>
                <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{d.buyer}</td>
                <td className="py-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#1B5E20', background: '#F1F8F0' }}>{d.status}</span>
                </td>
                <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{d.expires}</td>
                <td className="py-3">
                  <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#2196F3' }}>
                    <Download size={12} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
