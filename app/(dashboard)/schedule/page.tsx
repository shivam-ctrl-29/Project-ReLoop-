'use client';
import { CalendarClock, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import TopBar from '../../components/TopBar';

const slots = [
  { time: '9:00 AM – 11:00 AM', available: true },
  { time: '11:00 AM – 1:00 PM', available: false },
  { time: '2:00 PM – 4:00 PM', available: true },
  { time: '4:00 PM – 6:00 PM', available: true },
];

const upcoming = [
  { date: 'Mon 24 Jun', time: '9:00 AM', type: 'Used Oil', qty: '80 L', driver: 'Ramesh K.', status: 'Confirmed' },
  { date: 'Wed 26 Jun', time: '2:00 PM', type: 'E-Waste', qty: '5 items', driver: 'Pending', status: 'Scheduled' },
  { date: 'Sat 30 Jun', time: '9:00 AM', type: 'Used Oil', qty: 'TBD', driver: 'Pending', status: 'Requested' },
];

const statusColors: Record<string, { color: string; bg: string }> = {
  Confirmed: { color: '#1B5E20', bg: '#F1F8F0' },
  Scheduled: { color: '#2196F3', bg: '#E8F2FC' },
  Requested: { color: '#F59E0B', bg: '#FDF3E3' },
};

export default function SchedulePage() {
  return (
    <div>
      <TopBar title="Schedule Pickup" date="June 2026" />

      <div className="flex gap-5 mb-6">
        {/* Booking Form */}
        <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-base mb-5" style={{ color: '#1F2A24' }}>BOOK A PICKUP</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Pickup Type</label>
              <select className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white">
                <option>Used Oil</option>
                <option>E-Waste</option>
                <option>Both</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Quantity / Items</label>
              <input placeholder="e.g. 100 L or 5 items" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Preferred Date</label>
              <input type="date" defaultValue="2026-06-24" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Time Slot</label>
              <div className="space-y-2">
                {slots.map((s, i) => (
                  <label key={i} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    s.available ? 'border-gray-200 hover:border-green-300 hover:bg-green-50' : 'border-gray-100 opacity-40 cursor-not-allowed'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input type="radio" name="slot" disabled={!s.available} className="accent-green-700" />
                      <span className="text-sm">{s.time}</span>
                    </div>
                    {!s.available && <span className="text-xs text-gray-400">Full</span>}
                    {s.available && <span className="text-xs" style={{ color: '#1B5E20' }}>Available</span>}
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
            <button className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
              Confirm Pickup
            </button>
          </div>
        </div>

        {/* Upcoming Pickups */}
        <div className="flex-1 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>UPCOMING PICKUPS</h3>
            <div className="space-y-3">
              {upcoming.map((p, i) => {
                const s = statusColors[p.status];
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#F1F8F0' }}>
                        <Truck size={17} style={{ color: '#1B5E20' }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: '#1F2A24' }}>{p.date} · {p.time}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#5B6B63' }}>{p.type} · {p.qty} · Driver: {p.driver}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg }}>{p.status}</span>
                      {p.status === 'Requested' && (
                        <button className="text-xs text-red-500 font-medium">Cancel</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-base mb-4" style={{ color: '#1F2A24' }}>HOW PICKUP WORKS</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: CalendarClock, step: '1', label: 'Book Slot', desc: 'Choose date & time' },
                { icon: CheckCircle2, step: '2', label: 'Confirmation', desc: 'We confirm within 2 hrs' },
                { icon: Truck, step: '3', label: 'Collection', desc: 'Driver arrives on time' },
                { icon: CheckCircle2, step: '4', label: 'Certificate', desc: 'Auto-generated FSSAI cert' },
              ].map(({ icon: Icon, step, label, desc }) => (
                <div key={step} className="text-center p-4 rounded-xl" style={{ background: '#F1F8F0' }}>
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
