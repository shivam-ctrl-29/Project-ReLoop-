'use client';
import { useEffect, useState } from 'react';
import { Users, ShieldCheck, UserCheck, ShoppingBag, Recycle, Trash2, ChevronDown, Search, Loader2, Truck, FlaskConical, Gauge, X, Clock, CheckCircle2, Package } from 'lucide-react';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';
import { useUser } from '@/lib/useUser';

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  admin:     { label: 'Institution Admin', color: '#1B5E20', bg: '#F1F8F0' },
  dept_head: { label: 'Department Head',   color: '#2196F3', bg: '#E8F2FC' },
  buyer:     { label: 'Verified Buyer',    color: '#F59E0B', bg: '#FDF3E3' },
  recycler:  { label: 'Recycler Partner',  color: '#7C3AED', bg: '#F3F0FF' },
};

function RoleBadge({ role }: { role: string }) {
  const m = ROLE_META[role] || { label: role, color: '#5B6B63', bg: '#F5F7F5' };
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
}

function RoleDropdown({ user, onUpdate }: { user: any; onUpdate: (id: number, role: string) => void }) {
  const [open, setOpen] = useState(false);
  const roles = ['admin', 'dept_head', 'buyer', 'recycler'];
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs font-semibold hover:underline"
        style={{ color: '#2196F3' }}>
        Change <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg p-1.5 min-w-[160px]">
          {roles.map(r => (
            <button key={r} onClick={() => { onUpdate(user.id, r); setOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-xs font-medium flex items-center gap-2"
              style={{ color: ROLE_META[r].color }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ROLE_META[r].color }} />
              {ROLE_META[r].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const currentUser = useUser();
  const currentUserId = currentUser?.id;
  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [toast, setToast]       = useState('');

  // Driver verification state
  const [pickups, setPickups]         = useState<any[]>([]);
  const [verifyPickup, setVerifyPickup] = useState<any>(null);
  const [tpcInput, setTpcInput]         = useState('');
  const [verifyQty, setVerifyQty]       = useState('');
  const [driverName, setDriverName]     = useState('');
  const [driverNote, setDriverNote]     = useState('');
  const [verifying, setVerifying]       = useState(false);
  const [verifyDone, setVerifyDone]     = useState<any>(null);

  const loadPickups = () =>
    fetch('/api/admin/pickups').then(r => r.json()).then(d => setPickups(Array.isArray(d?.pickups) ? d.pickups : [])).catch(() => {});

  const load = () => {
    setLoading(true);
    fetch('/api/admin/users').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  };

  useEffect(() => { load(); loadPickups(); }, []);

  function tpcToGrade(tpc: number) {
    if (tpc < 24) return { grade: 'A', label: 'Grade A — Premium', color: '#1B5E20', bg: '#F1F8F0', desc: 'Excellent. Highest biodiesel yield.' };
    if (tpc < 27) return { grade: 'B', label: 'Grade B — Standard', color: '#D97706', bg: '#FDF3E3', desc: 'Acceptable. Good yield after processing.' };
    return        { grade: 'C', label: 'Grade C — Basic',   color: '#DC2626', bg: '#FEF2F2', desc: 'Degraded. Requires extra refining.' };
  }

  const openVerify = (p: any) => {
    setVerifyPickup(p); setTpcInput(p.tpc_reading ?? ''); setVerifyQty(p.verified_quantity ?? '');
    setDriverName(p.driver_name ?? ''); setDriverNote(p.driver_note ?? ''); setVerifyDone(null);
  };

  const handleVerify = async () => {
    const tpc = parseFloat(tpcInput);
    if (isNaN(tpc)) return;
    setVerifying(true);
    const gradeInfo = tpcToGrade(tpc);
    const res = await fetch('/api/admin/pickups', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: verifyPickup.id, tpc_reading: tpc, verified_grade: gradeInfo.grade, verified_quantity: parseFloat(verifyQty) || null, driver_note: driverNote, driver_name: driverName }),
    });
    await res.json();
    setVerifyDone(gradeInfo); setVerifying(false); loadPickups();
  };

  const tpcGrade = tpcInput && !isNaN(parseFloat(tpcInput)) ? tpcToGrade(parseFloat(tpcInput)) : null;
  const pendingVerify = pickups.filter(p => p.pickup_type === 'oil' && p.tpc_reading == null && ['scheduled','confirmed','requested'].includes(p.status));
  const verifiedPickups = pickups.filter(p => p.tpc_reading != null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleRoleUpdate = async (id: number, role: string) => {
    if (id === currentUserId) {
      showToast('⚠ You cannot change your own role');
      return;
    }
    setUpdating(id);
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role }) });
    setUpdating(null);
    showToast('Role updated successfully');
    load();
  };

  const handleDelete = async (id: number, name: string) => {
    if (id === currentUserId) {
      showToast('⚠ You cannot delete your own account');
      return;
    }
    if (!confirm(`Remove user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setDeleting(null);
    showToast('User removed');
    load();
  };

  const users: any[]  = data?.users  || [];
  const stats: any    = data?.stats  || {};

  const filtered = users.filter(u => {
    const matchRole   = filter === 'all' || u.role === filter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div>
      <TopBar title="Admin Panel" date="June 2026" />

      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{ background: '#1B5E20' }}>
          {toast}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <StatCard label="Total Users"    value={String(stats.total     || 0)} change="Registered" changeType="info" icon={Users}     color="green" />
        <StatCard label="Admins"         value={String(stats.admins    || 0)} change="Full access" changeType="info" icon={ShieldCheck} color="green" />
        <StatCard label="Dept Heads"     value={String(stats.dept_heads|| 0)} change="Can list resources" changeType="info" icon={UserCheck}  color="blue"  />
        <StatCard label="Buyers"         value={String(stats.buyers    || 0)} change="Marketplace access" changeType="info" icon={ShoppingBag} color="amber" />
      </div>

      {/* ── Driver Verification Modal ── */}
      {verifyPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1B5E20' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><FlaskConical size={18} color="white" /></div>
                <div>
                  <div className="font-bold text-white text-base">Driver Oil Verification</div>
                  <div className="text-white/70 text-xs">Testo 270 / FOM Device Reading</div>
                </div>
              </div>
              <button onClick={() => setVerifyPickup(null)} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6">
              {verifyDone ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: verifyDone.bg }}>
                    <ShieldCheck size={32} style={{ color: verifyDone.color }} />
                  </div>
                  <div className="text-lg font-bold mb-1" style={{ color: '#1F2A24' }}>Verification Complete</div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-3" style={{ color: verifyDone.color, background: verifyDone.bg }}>{verifyDone.label}</div>
                  <p className="text-sm mb-1" style={{ color: '#5B6B63' }}>{verifyDone.desc}</p>
                  <p className="text-xs text-gray-400 mb-6">TPC: {tpcInput}% · Pickup #{verifyPickup.id}</p>
                  <button onClick={() => setVerifyPickup(null)} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: '#1B5E20' }}>Done</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl text-xs space-y-1" style={{ background: '#F5F7F5' }}>
                    <div className="font-semibold mb-1" style={{ color: '#1F2A24' }}>Pickup #{verifyPickup.id} — {verifyPickup.seller_name}</div>
                    <div style={{ color: '#5B6B63' }}>Qty: <span className="font-medium">{verifyPickup.quantity}</span> · Date: <span className="font-medium">{new Date(verifyPickup.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>DRIVER NAME</label>
                    <input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="e.g. Ramesh Verma" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>TPC READING (%) — TESTO 270 DEVICE</label>
                    <input type="number" min="0" max="100" step="0.1" value={tpcInput} onChange={e => setTpcInput(e.target.value)} placeholder="e.g. 18.5" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-600" />
                    {tpcGrade && <div className="mt-2 flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold" style={{ color: tpcGrade.color, background: tpcGrade.bg }}><ShieldCheck size={13} />{tpcGrade.label} — {tpcGrade.desc}</div>}
                    <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-xs">
                      {[{range:'< 24%',grade:'A',label:'Premium',color:'#1B5E20',bg:'#F1F8F0'},{range:'24–27%',grade:'B',label:'Standard',color:'#D97706',bg:'#FDF3E3'},{range:'> 27%',grade:'C',label:'Basic',color:'#DC2626',bg:'#FEF2F2'}].map(g => (
                        <div key={g.grade} className="p-2 rounded-lg font-semibold" style={{ background: g.bg, color: g.color }}><div className="font-bold">Grade {g.grade}</div><div className="text-xs opacity-80">{g.range}</div></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>ACTUAL QUANTITY (Liters)</label>
                    <input type="number" value={verifyQty} onChange={e => setVerifyQty(e.target.value)} placeholder="e.g. 840" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-600" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>DRIVER NOTE <span className="font-normal text-gray-400">(optional)</span></label>
                    <textarea value={driverNote} onChange={e => setDriverNote(e.target.value)} placeholder="e.g. Oil well sealed, slight discoloration" rows={2} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-600 resize-none" />
                  </div>
                  <button onClick={handleVerify} disabled={verifying || !tpcInput || !driverName} className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: '#1B5E20' }}>
                    {verifying ? <><Clock size={15} className="animate-spin" /> Verifying...</> : <><ShieldCheck size={15} /> Confirm Grade & Complete Pickup</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Pickup Verification Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>DRIVER OIL VERIFICATION</h3>
            <p className="text-xs mt-0.5" style={{ color: '#5B6B63' }}>Log TPC% readings from Testo 270 device on arrival</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#FDF3E3', color: '#F59E0B' }}>{pendingVerify.length} pending</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#F1F8F0', color: '#1B5E20' }}>{verifiedPickups.length} verified</span>
          </div>
        </div>
        {pickups.filter(p => p.pickup_type === 'oil').length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No oil pickups found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Pickup','Seller','Quantity','Scheduled','Status','TPC %','Grade','Action'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium text-xs" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pickups.filter(p => p.pickup_type === 'oil').map((p: any) => {
                const verified = p.tpc_reading != null;
                const grade = p.verified_grade;
                const gradeColor = grade === 'A' ? '#1B5E20' : grade === 'B' ? '#D97706' : '#DC2626';
                const gradeBg   = grade === 'A' ? '#F1F8F0' : grade === 'B' ? '#FDF3E3' : '#FEF2F2';
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 font-semibold text-xs" style={{ color: '#1B5E20' }}>#{p.id}</td>
                    <td className="py-3.5 text-xs" style={{ color: '#1F2A24' }}>{p.seller_name}<div className="text-gray-400">{p.department || ''}</div></td>
                    <td className="py-3.5 text-xs" style={{ color: '#5B6B63' }}>{p.quantity}</td>
                    <td className="py-3.5 text-xs" style={{ color: '#5B6B63' }}>{new Date(p.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="py-3.5"><span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{ color: p.status === 'confirmed' ? '#1B5E20' : p.status === 'collected' ? '#5B6B63' : '#F59E0B', background: p.status === 'confirmed' ? '#F1F8F0' : p.status === 'collected' ? '#F5F5F5' : '#FDF3E3' }}>{p.status}</span></td>
                    <td className="py-3.5 font-bold text-xs" style={{ color: verified ? '#1B5E20' : '#9CA3AF' }}>{verified ? `${p.tpc_reading}%` : '—'}</td>
                    <td className="py-3.5">{grade ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: gradeColor, background: gradeBg }}>Grade {grade}</span> : <span className="text-xs text-gray-400">Pending</span>}</td>
                    <td className="py-3.5">
                      {!verified && ['scheduled','confirmed','requested'].includes(p.status) ? (
                        <button onClick={() => openVerify(p)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-white" style={{ background: '#1B5E20' }}>
                          <FlaskConical size={11} /> Verify
                        </button>
                      ) : verified ? (
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#1B5E20' }}><ShieldCheck size={12} /> Done</span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>ALL USERS</h3>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5">
              <Search size={13} style={{ color: '#9CA3AF' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="text-xs outline-none w-44" style={{ color: '#1F2A24' }} />
            </div>
            {/* Role filter */}
            <div className="flex gap-1.5">
              {['all','admin','dept_head','buyer','recycler'].map(r => (
                <button key={r} onClick={() => setFilter(r)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors"
                  style={filter === r
                    ? { background: '#1B5E20', color: '#fff' }
                    : { background: '#F5F7F5', color: '#5B6B63' }}>
                  {r === 'all' ? 'All' : r === 'dept_head' ? 'Dept Head' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Loading users...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['User','Email','Role','Department','Institution','Pickups','Listings','Bids','Joined','Actions'].map(h => (
                  <th key={h} className="text-left pb-3 font-medium text-xs" style={{ color: '#5B6B63' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: ROLE_META[u.role]?.color || '#5B6B63' }}>
                        {u.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm" style={{ color: '#1F2A24' }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{u.email}</td>
                  <td className="py-3">
                    {updating === u.id
                      ? <Loader2 size={14} className="animate-spin" style={{ color: '#2196F3' }} />
                      : <RoleBadge role={u.role} />}
                  </td>
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>{u.department || '—'}</td>
                  <td className="py-3 text-xs max-w-[120px] truncate" style={{ color: '#5B6B63' }} title={u.institution}>{u.institution || '—'}</td>
                  <td className="py-3 text-center text-sm font-semibold" style={{ color: '#1B5E20' }}>{u.pickup_count}</td>
                  <td className="py-3 text-center text-sm font-semibold" style={{ color: '#2196F3' }}>
                    {Number(u.oil_listings) + Number(u.ewaste_listings)}
                  </td>
                  <td className="py-3 text-center text-sm font-semibold" style={{ color: '#F59E0B' }}>{u.bids_placed}</td>
                  <td className="py-3 text-xs" style={{ color: '#5B6B63' }}>
                    {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3">
                    {u.id === currentUserId ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#1B5E20', background: '#F1F8F0' }}>You</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <RoleDropdown user={u} onUpdate={handleRoleUpdate} />
                        <button onClick={() => handleDelete(u.id, u.name)}
                          disabled={deleting === u.id}
                          className="text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors">
                          {deleting === u.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-10 text-center text-sm text-gray-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
