'use client';
import { useEffect, useState } from 'react';
import { Users, ShieldCheck, UserCheck, ShoppingBag, Recycle, Trash2, ChevronDown, Search, Loader2 } from 'lucide-react';
import TopBar from '../../components/TopBar';
import StatCard from '../../components/StatCard';

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
  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [toast, setToast]       = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/users').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleRoleUpdate = async (id: number, role: string) => {
    setUpdating(id);
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role }) });
    setUpdating(null);
    showToast('Role updated successfully');
    load();
  };

  const handleDelete = async (id: number, name: string) => {
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
                    <div className="flex items-center gap-3">
                      <RoleDropdown user={u} onUpdate={handleRoleUpdate} />
                      <button onClick={() => handleDelete(u.id, u.name)}
                        disabled={deleting === u.id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors">
                        {deleting === u.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
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
