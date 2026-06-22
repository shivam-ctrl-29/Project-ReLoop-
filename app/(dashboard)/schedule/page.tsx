'use client';
import { useEffect, useState } from 'react';
import { CalendarClock, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import TopBar from '../../components/TopBar';

const slots = [
  { time: '9:00 AM – 11:00 AM', available: true },
  { time: '11:00 AM – 1:00 PM',  available: false },
  { time: '2:00 PM – 4:00 PM',   available: true },
  { time: '4:00 PM – 6:00 PM',   available: true },
];

const statusColors: Record<string, { color: string; bg: string }> = {
  confirmed: { color: '#1B5E20', bg: '#F1F8F0' },
  scheduled: { color: '#2196F3', bg: '#E8F2FC' },
  requested: { color: '#F59E0B', bg: '#FDF3E3' },
  collected: { color: '#5B6B63', bg: '#F5F5F5' },
};

export default function SchedulePage() {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('9:00 AM – 11:00 AM');
  const [form, setForm] = useState({ pickup_type: 'oil', quantity: '', scheduled_date: '2026-06-24' });

  const load = () => fetch('/api/pickups').then(r => r.json()).then(d => { setPickups(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/pickups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, time_slot: selectedSlot }),
    });
    setSaving(false);
    load();
  };

  const handleCancel = async (id: number) => {
    await fetch('/api/pickups', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'cancelled' }),
    });
    load();
  };

  const upcoming = pickups.filter(p => ['requested', 'scheduled', 'confirmed'].includes(p.status));

  return (
    <div>
      <TopBar title="Schedule Pickup" date="June 2026" />

      <div className="flex gap-5 mb-6">
        <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-base mb-5" style={{ color: '#1F2A24' }}>BOOK A PICKUP</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Pickup Type</label>
              <select value={form.pickup_type} onChange={e => setForm(f => ({ ...f, pickup_type: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white">
                <option value="oil">Used Oil</option>
                <option value="ewaste">E-Waste</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Quantity / Items</label>
              <input value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="e.g. 100 L or 5 items" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Preferred Date</label>
              <input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Time Slot</label>
              <div className="space-y-2">
                {slots.map((s, i) => (
                  <label key={i} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    !s.available ? 'border-gray-100 opacity-40 cursor-not-allowed' :
                    selectedSlot === s.time ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="slot" disabled={!s.available} checked={selectedSlot === s.time}
                        onChange={() => setSelectedSlot(s.time)} className="accent-green-700" />
                      <span className="text-sm">{s.time}</span>
                    </div>
                    {!s.available ? <span className="text-xs text-gray-400">Full</span>
                      : <span className="text-xs" style={{ color: '#1B5E20' }}>Available</span>}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Pickup Location</label>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200">
                <MapPin size={15} style={{ color: '#5B6B63' }} />
                <span className="text-sm" style={{ color: '#1F2A24' }}>Symbiosis University, Indore</span>
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
              {saving ? 'Booking...' : 'Confirm Pickup'}
            </button>
          </form>
        </div>

        <div className="flex-1 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>UPCOMING PICKUPS</h3>
            {loading ? <div className="text-sm text-gray-400 text-center py-4">Loading...</div> : (
              <div className="space-y-3">
                {upcoming.length === 0 && <div className="text-sm text-gray-400 text-center py-4">No upcoming pickups</div>}
                {upcoming.map((p: any, i: number) => {
                  const sc = statusColors[p.status] || { color: '#5B6B63', bg: '#F5F5F5' };
                  const dateStr = new Date(p.scheduled_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                  return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#F1F8F0' }}>
                          <Truck size={17} style={{ color: '#1B5E20' }} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: '#1F2A24' }}>{dateStr} · {p.time_slot}</div>
                          <div className="text-xs mt-0.5 capitalize" style={{ color: '#5B6B63' }}>{p.pickup_type} · {p.quantity || 'TBD'} · Driver: {p.driver_name || 'Pending'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ color: sc.color, background: sc.bg }}>{p.status}</span>
                        {p.status === 'requested' && (
                          <button onClick={() => handleCancel(p.id)} className="text-xs text-red-500 font-medium hover:underline">Cancel</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>HOW PICKUP WORKS</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: CalendarClock, label: 'Book Slot',    desc: 'Choose date & time' },
                { icon: CheckCircle2, label: 'Confirmation', desc: 'We confirm within 2 hrs' },
                { icon: Truck,        label: 'Collection',   desc: 'Driver arrives on time' },
                { icon: CheckCircle2, label: 'Certificate',  desc: 'Auto-generated FSSAI cert' },
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
