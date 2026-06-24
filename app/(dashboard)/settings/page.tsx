'use client';
import { useEffect, useState } from 'react';
import { User, Lock, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import TopBar from '../../components/TopBar';
import { ROLE_LABELS } from '@/lib/useUser';

const ROLE_COLORS: Record<string, string> = {
  admin: '#1B5E20', dept_head: '#2196F3', buyer: '#F59E0B', recycler: '#7C3AED',
};

export default function SettingsPage() {
  const [profile, setProfile]   = useState<any>(null);
  const [name, setName]         = useState('');
  const [dept, setDept]         = useState('');
  const [institution, setInstitution] = useState('');
  const [curPwd, setCurPwd]     = useState('');
  const [newPwd, setNewPwd]     = useState('');
  const [confPwd, setConfPwd]   = useState('');
  const [saving, setSaving]     = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setProfile(d); setName(d.name || ''); setDept(d.department || ''); setInstitution(d.institution || '');
    });
  }, []);

  const canEditInstitution = profile?.role === 'admin' || profile?.role === 'dept_head';

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, department: dept, ...(canEditInstitution && { institution_name: institution }) }),
    });
    setSaving(false);
    if (res.ok) {
      const stored = localStorage.getItem('reloop_user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('reloop_user', JSON.stringify({ ...u, name, department: dept }));
      }
      showToast('Profile updated successfully', true);
    } else showToast('Failed to update profile', false);
  };

  const changePassword = async () => {
    if (newPwd !== confPwd) { showToast('New passwords do not match', false); return; }
    if (newPwd.length < 8) { showToast('Password must be at least 8 characters', false); return; }
    setPwdSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }),
    });
    const data = await res.json();
    setPwdSaving(false);
    if (res.ok) { setCurPwd(''); setNewPwd(''); setConfPwd(''); showToast('Password changed successfully', true); }
    else showToast(data.error || 'Failed to change password', false);
  };

  const strength = (() => {
    if (!newPwd) return 0;
    let s = 0;
    if (newPwd.length >= 8) s++;
    if (/[A-Z]/.test(newPwd)) s++;
    if (/[0-9]/.test(newPwd)) s++;
    if (/[^A-Za-z0-9]/.test(newPwd)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#2196F3', '#1B5E20'][strength];

  return (
    <div>
      <TopBar title="Settings" date="June 2026" />

      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{ background: toast.ok ? '#1B5E20' : '#EF4444' }}>
          {toast.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-2xl space-y-5">
        {/* Profile card */}
        {profile && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ background: ROLE_COLORS[profile.role] ?? '#1B5E20' }}>
                {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: '#1F2A24' }}>{profile.name}</div>
                <div className="text-sm" style={{ color: '#5B6B63' }}>{profile.email}</div>
                <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                  style={{ background: ROLE_COLORS[profile.role] ?? '#1B5E20' }}>
                  {ROLE_LABELS[profile.role] ?? profile.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <User size={15} style={{ color: '#1B5E20' }} />
              <h3 className="font-bold text-sm" style={{ color: '#1F2A24' }}>PROFILE INFORMATION</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 transition-colors"
                  style={{ color: '#1F2A24' }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Email Address</label>
                <input value={profile.email} disabled
                  className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50"
                  style={{ color: '#9CA3AF' }} />
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Email cannot be changed</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Department</label>
                  <input value={dept} onChange={e => setDept(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 transition-colors"
                    style={{ color: '#1F2A24' }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>
                    Institution {canEditInstitution && <span className="font-normal" style={{ color: '#2196F3' }}>(editable)</span>}
                  </label>
                  {canEditInstitution ? (
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-green-500 transition-colors">
                      <Building2 size={13} style={{ color: '#5B6B63' }} />
                      <input value={institution} onChange={e => setInstitution(e.target.value)}
                        className="flex-1 text-sm outline-none bg-transparent"
                        style={{ color: '#1F2A24' }} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50">
                      <Building2 size={13} style={{ color: '#9CA3AF' }} />
                      <span className="text-sm truncate" style={{ color: '#9CA3AF' }}>{profile.institution || 'N/A'}</span>
                    </div>
                  )}
                  {!canEditInstitution && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Only Admin or Dept Head can edit institution name</p>}
                </div>
              </div>
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-opacity"
                style={{ background: '#1B5E20' }}>
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* Password card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={15} style={{ color: '#2196F3' }} />
            <h3 className="font-bold text-sm" style={{ color: '#1F2A24' }}>CHANGE PASSWORD</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Current Password</label>
              <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                placeholder="Enter current password" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>New Password</label>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                placeholder="Minimum 8 characters" />
              {newPwd && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColor : '#E5E7EB' }} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#5B6B63' }}>Confirm New Password</label>
              <input type="password" value={confPwd} onChange={e => setConfPwd(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                placeholder="Re-enter new password"
                style={{ borderColor: confPwd && confPwd !== newPwd ? '#EF4444' : '' }} />
              {confPwd && confPwd !== newPwd && (
                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>Passwords do not match</p>
              )}
            </div>
            <button onClick={changePassword} disabled={pwdSaving || !curPwd || !newPwd || newPwd !== confPwd}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-opacity"
              style={{ background: '#2196F3' }}>
              {pwdSaving ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Platform info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-sm mb-4" style={{ color: '#1F2A24' }}>PLATFORM INFO</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Platform', 'ReLoop v1.0'],
              ['Team', 'Team EcoNova'],
              ['Hackathon', 'Green Tech 2026'],
              ['Institution', 'SUAS, Indore'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl p-3" style={{ background: '#F5F7F5' }}>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>{k}</div>
                <div className="text-sm font-semibold mt-0.5" style={{ color: '#1F2A24' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
