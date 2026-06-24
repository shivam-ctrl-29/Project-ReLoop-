'use client';
import { useEffect, useState } from 'react';
import { FileText, ShieldCheck, Download, CheckCircle2, AlertCircle, Clock, Loader2, Plus, X, Upload } from 'lucide-react';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import { jsPDF } from 'jspdf';

import { useUser } from '@/lib/useUser';

function getComplianceStatus(docs: any[], role: string) {
  const hasFSSAI   = docs.some(d => d.doc_name?.toLowerCase().includes('fssai') || d.doc_type === 'fssai');
  const hasEWaste  = docs.some(d => d.doc_name?.toLowerCase().includes('e-waste') || d.doc_type === 'ewaste');
  const hasEPR     = docs.some(d => d.doc_name?.toLowerCase().includes('epr') || d.doc_type === 'epr');
  const validCount = docs.filter(d => d.status === 'valid').length;
  const total      = docs.length;
  const expiringSoon = docs.filter(d => {
    if (!d.expires_date) return false;
    const days = (new Date(d.expires_date).getTime() - Date.now()) / (1000 * 86400);
    return days > 0 && days < 30;
  }).length;

  const statuses = [];

  if (role === 'buyer') {
    statuses.push(
      {
        name: 'EPR Certificates (Producers)',
        status: hasEPR || hasEWaste ? 'Compliant' : total === 0 ? 'No Data' : 'Pending',
        detail: hasEPR || hasEWaste ? 'EPR matching certified' : 'No EPR docs found',
        icon: hasEPR || hasEWaste ? CheckCircle2 : AlertCircle,
        color: hasEPR || hasEWaste ? '#1B5E20' : '#F59E0B',
        bg:    hasEPR || hasEWaste ? '#F1F8F0'  : '#FDF3E3',
      },
      {
        name: 'Authorized Recycler License',
        status: hasEWaste ? 'Compliant' : total === 0 ? 'No Data' : 'Pending',
        detail: hasEWaste ? 'Valid CPCB authorization' : 'No recycler license found',
        icon: hasEWaste ? CheckCircle2 : AlertCircle,
        color: hasEWaste ? '#1B5E20' : '#F59E0B',
        bg:    hasEWaste ? '#F1F8F0'  : '#FDF3E3',
      },
      {
        name: 'FSSAI License Validation',
        status: hasFSSAI ? 'Compliant' : total === 0 ? 'No Data' : 'Pending',
        detail: hasFSSAI ? 'Verified for RUCO collection' : 'No FSSAI docs found',
        icon: hasFSSAI ? CheckCircle2 : AlertCircle,
        color: hasFSSAI ? '#1B5E20' : '#F59E0B',
        bg:    hasFSSAI ? '#F1F8F0'  : '#FDF3E3',
      }
    );
  } else {
    statuses.push(
      {
        name: 'FSSAI Compliance',
        status: hasFSSAI ? 'Compliant' : total === 0 ? 'No Data' : 'Pending',
        detail: hasFSSAI ? 'All oil disposals certified' : 'No FSSAI docs found',
        icon: hasFSSAI ? CheckCircle2 : AlertCircle,
        color: hasFSSAI ? '#1B5E20' : '#F59E0B',
        bg:    hasFSSAI ? '#F1F8F0'  : '#FDF3E3',
      },
      {
        name: 'E-Waste Management Rules 2022',
        status: hasEWaste ? 'Compliant' : total === 0 ? 'No Data' : 'Pending',
        detail: hasEWaste ? 'CPCB recyclers verified' : 'No e-waste docs found',
        icon: hasEWaste ? CheckCircle2 : AlertCircle,
        color: hasEWaste ? '#1B5E20' : '#F59E0B',
        bg:    hasEWaste ? '#F1F8F0'  : '#FDF3E3',
      },
      {
        name: 'NAAC Green Campus Metrics',
        status: validCount >= 3 ? 'On Track' : 'Partial',
        detail: `${validCount} of ${Math.max(total, 5)} SDG indicators tracked`,
        icon: validCount >= 3 ? CheckCircle2 : AlertCircle,
        color: validCount >= 3 ? '#1B5E20' : '#F59E0B',
        bg:    validCount >= 3 ? '#F1F8F0'  : '#FDF3E3',
      }
    );
  }

  statuses.push({
    name: 'CSR/ESG Annual Report',
    status: expiringSoon > 0 ? `${expiringSoon} expiring soon` : 'Due Oct',
    detail: expiringSoon > 0 ? 'Review & renew before deadline' : 'Q3 data being collected',
    icon: expiringSoon > 0 ? Clock : AlertCircle,
    color: expiringSoon > 0 ? '#EF4444' : '#2196F3',
    bg:    expiringSoon > 0 ? '#FEF2F2' : '#E8F2FC',
  });

  return statuses;
}

function downloadFSSAICert(doc: any, user: any) {
  const issued  = doc.issued_date  ? new Date(doc.issued_date).toLocaleDateString('en-IN') : '—';
  const expires = doc.expires_date ? new Date(doc.expires_date).toLocaleDateString('en-IN') : 'N/A';

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  
  // Outer Border
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.5);
  pdf.rect(5, 5, W - 10, H - 10);
  
  // Header Texts
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Form C', W/2, 25, { align: 'center' });
  pdf.text('Government of India', W/2, 32, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text('Food Safety and Standards Authority of India', W/2, 38, { align: 'center' });
  pdf.text('License under FSS Act, 2006', W/2, 44, { align: 'center' });
  
  // Logos (Text representations)
  pdf.setFontSize(28);
  pdf.setTextColor(30, 64, 175); // Blue
  pdf.text('fssai', 20, 35);
  
  pdf.setFontSize(10);
  pdf.setTextColor(0);
  pdf.text('Satyameva Jayate', W - 35, 40, { align: 'center' });

  // License Number
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`License Number: ${doc.doc_code}`, W/2, 60, { align: 'center' });
  
  // Details
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  let startY = 80;
  const lineSpacing = 12;
  
  pdf.text('1. Name & Registered Office address of Licensee:', 15, startY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(doc.buyer_name || user?.name || 'ReLoop Authorized Partner', 95, startY, { maxWidth: 100 });
  
  startY += lineSpacing;
  pdf.setFont('helvetica', 'normal');
  pdf.text('2. Address of Authorized Premises:', 15, startY);
  pdf.setFont('helvetica', 'bold');
  pdf.text(user?.institution || 'Registered Premises', 95, startY, { maxWidth: 100 });
  
  startY += lineSpacing;
  pdf.setFont('helvetica', 'normal');
  pdf.text('3. Kind of Business:', 15, startY);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Manufacturer - General Manufacturing', 95, startY);
  pdf.text('Trade/Retail - e-Commerce', 95, startY + 5);
  
  startY += lineSpacing + 5;
  pdf.setFont('helvetica', 'normal');
  pdf.text('4. Dairy Business Details:', 15, startY);
  pdf.setFont('helvetica', 'bold');
  pdf.text('No', 95, startY);
  
  startY += lineSpacing;
  pdf.setFont('helvetica', 'normal');
  pdf.text('5. Category of License:', 15, startY);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Central License', 95, startY);
  
  startY += 20;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  const disclaimer = 'This license is granted under and is subject to the provisions of FSS Act, 2006 all of which must be complied with by the licensee.';
  pdf.text(disclaimer, 15, startY, { maxWidth: W - 30 });
  
  startY += 20;
  pdf.setFontSize(10);
  pdf.text('Place:', 15, startY);
  pdf.text('FSSAI Delhi', 40, startY);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Designated Officer', W - 45, startY);
  
  startY += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.text('Issued On:', 15, startY);
  pdf.text(issued, 40, startY);
  
  startY += 8;
  pdf.text('Valid Upto:', 15, startY);
  pdf.text(expires, 40, startY);
  
  // Annexures
  startY += 20;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Annexures:', 15, startY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 64, 175);
  pdf.text('1. Product Annexure', 15, startY + 6);
  pdf.text('2. Validity Annexure', 15, startY + 12);
  pdf.text('3. Non-Form C Annexure', 15, startY + 18);
  pdf.text('4. Conditions Of License', 15, startY + 24);
  pdf.setTextColor(0);

  // Footer Note
  startY += 40;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('Note:', 15, startY);
  
  startY += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  const note1 = '1. Application for renewal of License can be filed as early as 180 days prior to expiry date of License. You can file application for renewal or modification of License by login into FSSAI\'s Food Safety Compliance System(https://foscos.fssai.gov.in) with your user id and password or call us at 1800112100 for any clarification.';
  const note2 = '2. This License is only to commence or carry on food businesses and not for any other purpose.';
  const note3 = '3. This is computer generated license and doesn\'t require any signature or stamp by authority.';
  
  pdf.text(note1, 15, startY, { maxWidth: W - 30 });
  startY += 12;
  pdf.text(note2, 15, startY, { maxWidth: W - 30 });
  startY += 8;
  pdf.text(note3, 15, startY, { maxWidth: W - 30 });

  pdf.save(`${doc.doc_code}-FSSAI-License.pdf`);
}

function downloadCert(doc: any, user: any) {
  if (doc.doc_type === 'fssai') {
    return downloadFSSAICert(doc, user);
  }

  const issued    = doc.issued_date  ? new Date(doc.issued_date).toLocaleDateString('en-IN',  { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const expires   = doc.expires_date ? new Date(doc.expires_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const generated = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  pdf.setFillColor(27, 94, 32); pdf.rect(0, 0, W, 70, 'F');
  pdf.setFillColor(245, 158, 11); pdf.rect(0, 70, W, 3, 'F');
  pdf.setTextColor(255,255,255); pdf.setFontSize(22); pdf.setFont('helvetica','bold');
  pdf.text('ReLoop', W/2, 22, { align: 'center' });
  pdf.setFontSize(8); pdf.setFont('helvetica','normal'); pdf.setTextColor(200,230,200);
  pdf.text('CIRCULAR RESOURCE MANAGEMENT PLATFORM', W/2, 29, { align: 'center' });
  pdf.setFontSize(16); pdf.setFont('helvetica','bold'); pdf.setTextColor(255,255,255);
  pdf.text(doc.doc_name, W/2, 48, { align: 'center' });
  pdf.setFontSize(9); pdf.setFont('helvetica','normal'); pdf.setTextColor(180,220,180);
  pdf.text('Official Compliance Certificate · Symbiosis University of Applied Sciences, Indore', W/2, 56, { align: 'center' });
  pdf.setFontSize(8); pdf.text(`Certificate ID: ${doc.doc_code}`, W/2, 64, { align: 'center' });
  pdf.setTextColor(91,107,99); pdf.setFontSize(10); pdf.setFont('helvetica','normal');
  pdf.text('This is to certify that', W/2, 85, { align: 'center' });
  pdf.setFontSize(14); pdf.setFont('helvetica','bold'); pdf.setTextColor(31,42,36);
  pdf.text('Symbiosis University of Applied Sciences, Indore', W/2, 94, { align: 'center' });
  pdf.setFontSize(10); pdf.setFont('helvetica','normal'); pdf.setTextColor(91,107,99);
  pdf.text('has fulfilled all requirements for the compliance record listed below.', W/2, 102, { align: 'center' });
  const fields = [
    ['Certificate ID', doc.doc_code], ['Document Type', doc.doc_name],
    ['Issued Date', issued], ['Valid Until', expires],
    ['Quantity / Scope', doc.quantity || 'As per record'], ['Verified Party', doc.buyer_name || 'Self-certified'],
    ['Status', doc.status?.toUpperCase() || 'VALID'], ['Generated On', generated],
  ];
  const colW = 85, rowH = 16, startX = 20, startY = 115;
  fields.forEach(([label, value], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = startX + col * (colW + 10), y = startY + row * rowH;
    pdf.setFillColor(245,247,245); pdf.roundedRect(x, y, colW, 13, 2, 2, 'F');
    pdf.setFontSize(7); pdf.setFont('helvetica','bold'); pdf.setTextColor(156,163,175);
    pdf.text(label.toUpperCase(), x+4, y+5);
    pdf.setFontSize(9); pdf.setFont('helvetica','bold'); pdf.setTextColor(31,42,36);
    pdf.text(String(value), x+4, y+10.5);
  });
  const divY = startY + Math.ceil(fields.length/2) * rowH + 8;
  pdf.setDrawColor(229,231,235); pdf.setLineWidth(0.5); pdf.line(20, divY, W-20, divY);
  const sigY = divY + 12;
  pdf.setFillColor(241,248,240); pdf.roundedRect(20, sigY, 80, 22, 3, 3, 'F');
  pdf.setFontSize(7); pdf.setFont('helvetica','normal'); pdf.setTextColor(91,107,99);
  pdf.text('Authorised by', 24, sigY+7);
  pdf.setFontSize(9); pdf.setFont('helvetica','bold'); pdf.setTextColor(27,94,32);
  pdf.text('Team EcoNova', 24, sigY+13);
  pdf.setFontSize(7); pdf.setFont('helvetica','normal'); pdf.setTextColor(91,107,99);
  pdf.text('ReLoop Platform · Green Tech Hackathon 2026', 24, sigY+18);
  pdf.setFillColor(232,242,252); pdf.roundedRect(W-80, sigY, 60, 22, 3, 3, 'F');
  pdf.setFontSize(7); pdf.setTextColor(33,150,243);
  pdf.text('Verify at: reloop.in', W-77, sigY+7);
  pdf.setTextColor(91,107,99);
  pdf.text(`Doc: ${doc.doc_code}`, W-77, sigY+13);
  pdf.text(`Issued: ${issued}`, W-77, sigY+18);
  pdf.setFillColor(245,247,245); pdf.rect(0, H-14, W, 14, 'F');
  pdf.setFontSize(7); pdf.setTextColor(156,163,175);
  pdf.text('This document was auto-generated by ReLoop · Symbiosis University of Applied Sciences, Indore', W/2, H-7, { align: 'center' });
  pdf.text(`Generated: ${generated}`, W/2, H-3, { align: 'center' });
  pdf.save(`${doc.doc_code}-${doc.doc_name.replace(/\s+/g,'-')}.pdf`);
}

function exportAll(docs: any[], user: any) {
  docs.forEach((doc, i) => setTimeout(() => downloadCert(doc, user), i * 400));
}

const DOC_TYPES = [
  { value: 'fssai',       label: 'FSSAI License' },
  { value: 'ewaste_auth', label: 'E-Waste Authorization (CPCB)' },
  { value: 'esg_report',  label: 'ESG / CSR Report' },
  { value: 'cpcb',        label: 'CPCB Certificate' },
  { value: 'epr',         label: 'EPR Certificate' },
  { value: 'other',       label: 'Other Document' },
];

export default function CompliancePage() {
  const user                          = useUser();
  const [data, setData]               = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showUpload, setShowUpload]   = useState(false);
  const [saving, setSaving]           = useState(false);
  const [uploadDone, setUploadDone]   = useState(false);
  const [form, setForm]               = useState({
    doc_name: '', doc_type: 'fssai', issued_date: '', expires_date: '', quantity: '', buyer_name: '',
  });

  const load = () =>
    fetch('/api/compliance').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setUploadDone(true);
      load();
      setTimeout(() => { setUploadDone(false); setShowUpload(false); setForm({ doc_name: '', doc_type: 'fssai', issued_date: '', expires_date: '', quantity: '', buyer_name: '' }); }, 1800);
    }
  };

  const docs  = data?.docs  || [];
  const stats = data?.stats || {};
  const complianceStatus = getComplianceStatus(docs, user?.role || 'dept_head');

  const handleDownload = (doc: any) => {
    setDownloading(doc.doc_code);
    setTimeout(() => { downloadCert(doc, user); setDownloading(null); }, 400);
  };

  return (
    <div>
      <TopBar title="Compliance Docs" date="June 2026" />

      <div className="flex gap-4 mb-6">
        <StatCard label="Certificates Ready"   value={String(stats.valid_count  || 0)} change="This month" changeType="info" icon={FileText}     color="green" />
        <StatCard label="Total Docs Generated" value={String(stats.total_count  || 0)} change="All time"   changeType="info" icon={ShieldCheck}   color="amber" />
        <StatCard label="Compliance Score"     value={docs.length > 0 ? String(Math.round((Number(stats.valid_count||0)/Math.max(Number(stats.total_count||1),1))*100)) : '0'} unit="%" change={docs.length > 0 ? 'Based on docs' : 'No docs yet'} changeType="up" icon={CheckCircle2} color="green" />
        <StatCard label="Next Report Due"      value="Oct" unit="2026" change="CSR/ESG" changeType="info" icon={FileText} color="blue" />
      </div>

      {/* Dynamic compliance status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>COMPLIANCE STATUS</h3>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
            <Loader2 size={14} className="animate-spin" /> Calculating compliance status...
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {complianceStatus.map(({ name, status, detail, icon: Icon, color, bg }) => (
              <div key={name} className="p-4 rounded-xl transition-all" style={{ background: bg }}>
                <Icon size={20} style={{ color }} className="mb-2" />
                <div className="text-sm font-semibold mb-1" style={{ color: '#1F2A24' }}>{name}</div>
                <div className="text-xs font-semibold mb-1" style={{ color }}>{status}</div>
                <div className="text-xs" style={{ color: '#5B6B63' }}>{detail}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>CERTIFICATES & DOCUMENTS</h3>
          <div className="flex gap-2">
            <button onClick={() => { setShowUpload(true); setUploadDone(false); }}
              className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-lg font-semibold text-white"
              style={{ background: '#2196F3' }}>
              <Plus size={13} /> Add Document
            </button>
            <button onClick={() => exportAll(docs, user)} disabled={loading || docs.length === 0}
              className="flex items-center gap-2 text-xs px-4 py-1.5 rounded-lg font-semibold text-white disabled:opacity-50 transition-opacity"
              style={{ background: '#1B5E20' }}>
              <Download size={13} /> Export All ({docs.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Loading certificates...
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No certificates found. Complete a pickup to generate certificates.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Doc ID','Certificate Name','Issued','Quantity','Buyer / Recycler','Status','Expires','Action'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((d: any) => (
                <tr key={d.doc_code} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-semibold text-xs" style={{ color: '#1B5E20' }}>{d.doc_code}</td>
                  <td className="py-3 font-medium" style={{ color: '#1F2A24' }}>{d.doc_name}</td>
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>
                    {new Date(d.issued_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{d.quantity}</td>
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{d.buyer_name}</td>
                  <td className="py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                      style={{ color: d.status === 'valid' ? '#1B5E20' : '#F59E0B', background: d.status === 'valid' ? '#F1F8F0' : '#FDF3E3' }}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>
                    {d.expires_date ? new Date(d.expires_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-3">
                    <button onClick={() => handleDownload(d)} disabled={downloading === d.doc_code}
                      className="flex items-center gap-1 text-xs font-semibold hover:underline disabled:opacity-50 transition-opacity"
                      style={{ color: '#2196F3' }}>
                      {downloading === d.doc_code
                        ? <><Loader2 size={11} className="animate-spin" /> Preparing...</>
                        : <><Download size={12} /> Download</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Upload Document Modal ── */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {uploadDone ? (
              <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#F1F8F0' }}>
                  <CheckCircle2 size={36} style={{ color: '#1B5E20' }} />
                </div>
                <div className="text-xl font-bold mb-2" style={{ color: '#1B5E20', fontFamily: 'Georgia, serif' }}>Document Added!</div>
                <div className="text-sm" style={{ color: '#5B6B63' }}>Your compliance document has been recorded and is now valid.</div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Upload size={18} style={{ color: '#2196F3' }} />
                    <span className="font-bold text-base" style={{ color: '#1F2A24' }}>Add Compliance Document</span>
                  </div>
                  <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                </div>
                <form onSubmit={handleUpload} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#5B6B63' }}>Document Name *</label>
                      <input required value={form.doc_name} onChange={e => setForm(f => ({ ...f, doc_name: e.target.value }))}
                        placeholder="e.g. FSSAI License 2026" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#5B6B63' }}>Document Type *</label>
                      <select required value={form.doc_type} onChange={e => setForm(f => ({ ...f, doc_type: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-blue-400">
                        {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#5B6B63' }}>Issue Date</label>
                      <input type="date" value={form.issued_date} onChange={e => setForm(f => ({ ...f, issued_date: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#5B6B63' }}>Expiry Date</label>
                      <input type="date" value={form.expires_date} onChange={e => setForm(f => ({ ...f, expires_date: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#5B6B63' }}>Quantity / Scope</label>
                      <input value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                        placeholder="e.g. 500 L" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#5B6B63' }}>Verified Party</label>
                      <input value={form.buyer_name} onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))}
                        placeholder="e.g. FSSAI / CPCB" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-400" />
                    </div>
                  </div>
                  <div className="rounded-xl p-3 text-xs" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                    Document will be saved as <span className="font-semibold">Valid</span> and available for download immediately.
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowUpload(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: '#2196F3' }}>
                      {saving
                        ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                        : <><Upload size={14} /> Save Document</>}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
