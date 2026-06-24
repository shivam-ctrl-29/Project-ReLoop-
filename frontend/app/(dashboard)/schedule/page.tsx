'use client';
import { useEffect, useState } from 'react';
import { CalendarClock, MapPin, Truck, CheckCircle2, AlertCircle, X, Clock, Package, FlaskConical, ShieldCheck, Gauge } from 'lucide-react';
import TopBar from '../../components/TopBar';

const ALL_SLOTS = [
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
];

const statusColors: Record<string, { color: string; bg: string }> = {
  confirmed: { color: '#1B5E20', bg: '#F1F8F0' },
  scheduled: { color: '#2196F3', bg: '#E8F2FC' },
  requested: { color: '#F59E0B', bg: '#FDF3E3' },
  collected: { color: '#5B6B63', bg: '#F5F5F5' },
  cancelled: { color: '#DC2626', bg: '#FEF2F2' },
};

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function tpcToGrade(tpc: number): { grade: string; label: string; color: string; bg: string; desc: string } {
  if (tpc < 24) return { grade: 'A', label: 'Grade A — Premium', color: '#1B5E20', bg: '#F1F8F0', desc: 'Excellent quality. Highest biodiesel yield.' };
  if (tpc < 27) return { grade: 'B', label: 'Grade B — Standard', color: '#D97706', bg: '#FDF3E3', desc: 'Acceptable quality. Good yield after processing.' };
  return        { grade: 'C', label: 'Grade C — Basic',   color: '#DC2626', bg: '#FEF2F2', desc: 'Degraded oil. Requires extra refining.' };
}

export default function SchedulePage() {
  const [pickups, setPickups]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState<any>(null);
  const [error, setError]           = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Driver verification modal state
  const [verifyPickup, setVerifyPickup] = useState<any>(null);
  const [tpcInput, setTpcInput]         = useState('');
  const [verifyQty, setVerifyQty]       = useState('');
  const [driverName, setDriverName]     = useState('');
  const [driverNote, setDriverNote]     = useState('');
  const [verifying, setVerifying]       = useState(false);
  const [verifyDone, setVerifyDone]     = useState<any>(null);

  const [selectedSlot, setSelectedSlot] = useState(ALL_SLOTS[0]);
  const [form, setForm] = useState({
    pickup_type: 'oil',
    quantity: '',
    scheduled_date: todayPlus(1),
  });

  const load = () =>
    fetch('/api/pickups')
      .then(r => r.json())
      .then(d => { setPickups(Array.isArray(d?.pickups) ? d.pickups : []); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const bookedSlots = pickups
    .filter(p => {
      const pd = new Date(p.scheduled_date).toISOString().split('T')[0];
      return pd === form.scheduled_date && ['requested', 'scheduled', 'confirmed'].includes(p.status);
    })
    .map(p => p.time_slot);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(null);
    if (!form.quantity.trim()) { setError('Please enter quantity or number of items.'); return; }
    if (form.scheduled_date < todayPlus(0)) { setError('Please choose a future date.'); return; }
    if (bookedSlots.includes(selectedSlot)) { setError('This slot is already booked.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/pickups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, time_slot: selectedSlot }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Booking failed.'); }
      else { setSuccess(data); setForm({ pickup_type: 'oil', quantity: '', scheduled_date: todayPlus(1) }); setSelectedSlot(ALL_SLOTS[0]); load(); }
    } catch { setError('Network error.'); }
    finally { setSaving(false); }
  };

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      await fetch('/api/pickups', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'cancelled' }) });
      load();
    } finally { setCancellingId(null); }
  };

  const openVerify = (p: any) => {
    setVerifyPickup(p);
    setTpcInput(p.tpc_reading ?? '');
    setVerifyQty(p.verified_quantity ?? p.quantity ?? '');
    setDriverName(p.driver_name ?? '');
    setDriverNote(p.driver_note ?? '');
    setVerifyDone(null);
  };

  const handleVerify = async () => {
    const tpc = parseFloat(tpcInput);
    if (isNaN(tpc) || tpc < 0 || tpc > 100) return;
    setVerifying(true);
    const gradeInfo = tpcToGrade(tpc);
    try {
      const res = await fetch('/api/pickups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: verifyPickup.id,
          tpc_reading: tpc,
          verified_grade: gradeInfo.grade,
          verified_quantity: parseFloat(verifyQty) || null,
          driver_note: driverNote,
          driver_name: driverName,
        }),
      });
      const data = await res.json();
      setVerifyDone({ ...gradeInfo, data });
      load();
    } finally { setVerifying(false); }
  };

  const tpcGrade = tpcInput ? tpcToGrade(parseFloat(tpcInput)) : null;

  const upcoming = pickups.filter(p => ['requested', 'scheduled', 'confirmed'].includes(p.status));
  const past     = pickups.filter(p => ['collected', 'cancelled'].includes(p.status));

  return (
    <div>
      <TopBar title="Schedule Pickup" date="June 2026" />

      {/* ── Driver Verification Modal ── */}
      {verifyPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1B5E20' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <FlaskConical size={18} color="white" />
                </div>
                <div>
                  <div className="font-bold text-white text-base">Driver Oil Verification</div>
                  <div className="text-white/70 text-xs">Testo 270 / FOM Device Reading</div>
                </div>
              </div>
              <button onClick={() => setVerifyPickup(null)} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {verifyDone ? (
                /* ── Success screen ── */
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: verifyDone.bg }}>
                    <ShieldCheck size={32} style={{ color: verifyDone.color }} />
                  </div>
                  <div className="text-lg font-bold mb-1" style={{ color: '#1F2A24' }}>Verification Complete</div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-3" style={{ color: verifyDone.color, background: verifyDone.bg }}>
                    {verifyDone.label}
                  </div>
                  <p className="text-sm mb-1" style={{ color: '#5B6B63' }}>{verifyDone.desc}</p>
                  <p className="text-xs text-gray-400 mb-6">TPC: {tpcInput}% · Pickup #{verifyPickup.id} confirmed</p>
                  <button onClick={() => setVerifyPickup(null)}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: '#1B5E20' }}>
                    Done
                  </button>
                </div>
              ) : (
                /* ── Input form ── */
                <div className="space-y-4">
                  {/* Pickup info */}
                  <div className="p-3 rounded-xl text-xs space-y-1" style={{ background: '#F5F7F5' }}>
                    <div className="font-semibold mb-1" style={{ color: '#1F2A24' }}>Pickup #{verifyPickup.id}</div>
                    <div style={{ color: '#5B6B63' }}>Type: <span className="font-medium capitalize">{verifyPickup.pickup_type}</span></div>
                    <div style={{ color: '#5B6B63' }}>Scheduled Qty: <span className="font-medium">{verifyPickup.quantity}</span></div>
                    <div style={{ color: '#5B6B63' }}>Date: <span className="font-medium">{new Date(verifyPickup.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                  </div>

                  {/* Driver name */}
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>DRIVER NAME</label>
                    <input value={driverName} onChange={e => setDriverName(e.target.value)}
                      placeholder="e.g. Ramesh Verma"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-600" />
                  </div>

                  {/* TPC reading */}
                  <div>
                    <label className="text-xs font-semibold block mb-1.5 flex items-center gap-2" style={{ color: '#5B6B63' }}>
                      <Gauge size={12} /> TPC READING (%) — FROM TESTO 270 DEVICE
                    </label>
                    <input type="number" min="0" max="100" step="0.1"
                      value={tpcInput} onChange={e => setTpcInput(e.target.value)}
                      placeholder="e.g. 18.5"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-600" />
                    {/* Live grade preview */}
                    {tpcGrade && !isNaN(parseFloat(tpcInput)) && (
                      <div className="mt-2 flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold" style={{ color: tpcGrade.color, background: tpcGrade.bg }}>
                        <ShieldCheck size={13} />
                        {tpcGrade.label} — {tpcGrade.desc}
                      </div>
                    )}
                    <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-xs">
                      {[
                        { range: '< 24%', grade: 'A', label: 'Premium', color: '#1B5E20', bg: '#F1F8F0' },
                        { range: '24–27%', grade: 'B', label: 'Standard', color: '#D97706', bg: '#FDF3E3' },
                        { range: '> 27%', grade: 'C', label: 'Basic', color: '#DC2626', bg: '#FEF2F2' },
                      ].map(g => (
                        <div key={g.grade} className="p-2 rounded-lg font-semibold" style={{ background: g.bg, color: g.color }}>
                          <div className="font-bold">Grade {g.grade}</div>
                          <div className="text-xs opacity-80">{g.range}</div>
                          <div className="text-xs">{g.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actual quantity */}
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>ACTUAL QUANTITY COLLECTED (Liters)</label>
                    <input type="number" value={verifyQty} onChange={e => setVerifyQty(e.target.value)}
                      placeholder="e.g. 840"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-600" />
                  </div>

                  {/* Driver note */}
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>DRIVER NOTE <span className="font-normal text-gray-400">(optional)</span></label>
                    <textarea value={driverNote} onChange={e => setDriverNote(e.target.value)}
                      placeholder="e.g. Oil was slightly darker, containers well sealed"
                      rows={2}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-600 resize-none" />
                  </div>

                  <button onClick={handleVerify} disabled={verifying || !tpcInput || !driverName}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: '#1B5E20' }}>
                    {verifying ? <><Clock size={15} className="animate-spin" /> Verifying...</> : <><ShieldCheck size={15} /> Confirm Grade & Complete Pickup</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-5 mb-6">
        {/* ── Booking Form ── */}
        <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-shrink-0">
          <h3 className="font-bold text-base mb-5" style={{ color: '#1F2A24' }}>BOOK A PICKUP</h3>

          {success && (
            <div className="mb-4 p-4 rounded-xl border" style={{ background: '#F1F8F0', borderColor: '#BBF7D0' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} style={{ color: '#1B5E20' }} />
                  <span className="text-sm font-bold" style={{ color: '#1B5E20' }}>Pickup Booked!</span>
                </div>
                <button onClick={() => setSuccess(null)}><X size={14} className="text-gray-400" /></button>
              </div>
              <div className="text-xs space-y-1" style={{ color: '#5B6B63' }}>
                <div><span className="font-medium">ID:</span> #{success.id}</div>
                <div><span className="font-medium">Date:</span> {new Date(success.scheduled_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div><span className="font-medium">Slot:</span> {success.time_slot}</div>
                <div><span className="font-medium">Status:</span> Requested — we'll confirm within 2 hrs</div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>PICKUP TYPE</label>
              <select value={form.pickup_type} onChange={e => setForm(f => ({ ...f, pickup_type: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white">
                <option value="oil">Used Oil</option>
                <option value="ewaste">E-Waste</option>
                <option value="both">Both (Oil + E-Waste)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>QUANTITY / ITEMS</label>
              <input value={form.quantity} onChange={e => { setForm(f => ({ ...f, quantity: e.target.value })); setError(''); }}
                placeholder={form.pickup_type === 'oil' ? 'e.g. 80 L or 120 L' : 'e.g. 3 laptops, 2 phones'}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-100" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>PREFERRED DATE</label>
              <input type="date" value={form.scheduled_date} min={todayPlus(1)}
                onChange={e => { setForm(f => ({ ...f, scheduled_date: e.target.value })); setError(''); }}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>TIME SLOT</label>
              <div className="space-y-2">
                {ALL_SLOTS.map(slot => {
                  const booked = bookedSlots.includes(slot);
                  const selected = selectedSlot === slot;
                  return (
                    <label key={slot} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      booked ? 'border-gray-100 opacity-40 cursor-not-allowed' :
                      selected ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="slot" disabled={booked} checked={selected}
                          onChange={() => { setSelectedSlot(slot); setError(''); }} className="accent-green-700" />
                        <span className="text-sm" style={{ color: '#1F2A24' }}>{slot}</span>
                      </div>
                      {booked ? <span className="text-xs text-gray-400">Booked</span> : <span className="text-xs font-medium" style={{ color: '#1B5E20' }}>Available</span>}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>PICKUP LOCATION</label>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50">
                <MapPin size={14} style={{ color: '#5B6B63' }} />
                <span className="text-sm" style={{ color: '#1F2A24' }}>Symbiosis University, Indore</span>
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ background: '#1B5E20' }}>
              {saving ? <><Clock size={15} className="animate-spin" /> Booking...</> : 'Confirm Pickup'}
            </button>
          </form>
        </div>

        {/* ── Right column ── */}
        <div className="flex-1 space-y-5">
          {/* Upcoming */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>UPCOMING PICKUPS</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#F1F8F0', color: '#1B5E20' }}>
                {upcoming.length} active
              </span>
            </div>
            {loading ? (
              <div className="text-sm text-gray-400 text-center py-6">Loading...</div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Truck size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-400">No upcoming pickups</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((p: any) => {
                  const sc = statusColors[p.status] || { color: '#5B6B63', bg: '#F5F5F5' };
                  const dateStr = new Date(p.scheduled_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                  const canVerify = p.pickup_type === 'oil' && ['scheduled', 'confirmed', 'requested'].includes(p.status);
                  const alreadyVerified = p.tpc_reading != null;
                  return (
                    <div key={p.id} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F1F8F0' }}>
                            {p.pickup_type === 'ewaste' ? <Package size={17} style={{ color: '#1B5E20' }} /> : <Truck size={17} style={{ color: '#1B5E20' }} />}
                          </div>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: '#1F2A24' }}>{dateStr} · {p.time_slot}</div>
                            <div className="text-xs mt-0.5 capitalize" style={{ color: '#5B6B63' }}>
                              {p.pickup_type} · {p.quantity || 'Qty TBD'} · Driver: {p.driver_name || 'Pending'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: sc.color, background: sc.bg }}>
                            {p.status}
                          </span>
                          {canVerify && !alreadyVerified && (
                            <button onClick={() => openVerify(p)}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-white"
                              style={{ background: '#1B5E20' }}>
                              <FlaskConical size={11} /> Verify Oil
                            </button>
                          )}
                          {p.status === 'requested' && (
                            <button onClick={() => handleCancel(p.id)} disabled={cancellingId === p.id}
                              className="text-xs font-medium hover:underline disabled:opacity-50" style={{ color: '#DC2626' }}>
                              {cancellingId === p.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Show verified grade if already done */}
                      {alreadyVerified && (
                        <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl text-xs" style={{ background: '#F1F8F0' }}>
                          <ShieldCheck size={14} style={{ color: '#1B5E20' }} />
                          <span style={{ color: '#1B5E20' }} className="font-semibold">
                            Verified: TPC {p.tpc_reading}% → Grade {p.verified_grade}
                          </span>
                          {p.verified_quantity && <span style={{ color: '#5B6B63' }}>· {p.verified_quantity} L actual</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past pickups */}
          {past.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>PAST PICKUPS</h3>
              <div className="space-y-2">
                {past.map((p: any) => {
                  const sc = statusColors[p.status] || { color: '#5B6B63', bg: '#F5F5F5' };
                  const dateStr = new Date(p.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  return (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} style={{ color: sc.color }} />
                        <div>
                          <span className="text-sm font-medium" style={{ color: '#1F2A24' }}>{dateStr}</span>
                          <span className="text-xs ml-2 capitalize" style={{ color: '#5B6B63' }}>{p.pickup_type} · {p.quantity || '—'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.verified_grade && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              color: p.verified_grade === 'A' ? '#1B5E20' : p.verified_grade === 'B' ? '#D97706' : '#DC2626',
                              background: p.verified_grade === 'A' ? '#F1F8F0' : p.verified_grade === 'B' ? '#FDF3E3' : '#FEF2F2',
                            }}>
                            Grade {p.verified_grade}
                          </span>
                        )}
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: sc.color, background: sc.bg }}>{p.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>HOW PICKUP WORKS</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: CalendarClock, label: 'Book Slot',       desc: 'Choose date & time' },
                { icon: CheckCircle2,  label: 'Confirmation',    desc: 'We confirm within 2 hrs' },
                { icon: FlaskConical,  label: 'Driver Verifies', desc: 'TPC test on arrival' },
                { icon: ShieldCheck,   label: 'Certificate',     desc: 'Auto-grade FSSAI cert' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="text-center p-4 rounded-xl" style={{ background: '#F1F8F0' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: '#1B5E20' }}>
                    <Icon size={17} color="white" />
                  </div>
                  <div className="text-sm font-semibold" style={{ color: '#1F2A24' }}>{label}</div>
                  <div className="text-xs mt-1" style={{ color: '#5B6B63' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
