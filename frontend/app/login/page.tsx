'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Recycle, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const demoAccounts = [
  { label: 'Admin (Shivam)',  email: 'mathurshivv@gmail.com', role: 'Admin' },
  { label: 'Buyer (Nick)',    email: 'nicksaysv@gmail.com',   role: 'Buyer' },
  { label: 'Dept Head',       email: 'suraj@symbiosis.edu.in',role: 'Dept Head' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
      } else {
        setSuccess(`Welcome back, ${data.user.name}!`);
        localStorage.setItem('reloop_user', JSON.stringify(data.user));
        setTimeout(() => router.push('/dashboard'), 800);
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F7F5' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] p-10 text-white" style={{ background: '#1B5E20' }}>
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Recycle size={20} color="white" />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>ReLoop</div>
              <div className="text-xs text-white/70">Circular Resource Mgmt</div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4 leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
            Waste isn't waste until<br />no one's looking for it.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            ReLoop unifies used cooking oil, e-waste, and rainwater into one AI-powered circular resource exchange — no new hardware required.
          </p>

          <div className="space-y-4">
            {[
              { label: 'Oil Exchange', desc: 'AI-priced used oil marketplace' },
              { label: 'E-Waste Market', desc: 'Smart triage + verified recyclers' },
              { label: 'Rainwater AI', desc: 'Prophet-based harvest forecasting' },
              { label: 'Zero New Hardware', desc: 'Pure software + API integration' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div>
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-white/60 text-sm"> — {desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/50 text-xs">
          Team EcoNova · Symbiosis University of Applied Sciences, Indore
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#1B5E20' }}>
              <Recycle size={18} color="white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#1B5E20' }}>ReLoop</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: '#1F2A24', fontFamily: 'Georgia, serif' }}>Sign in to your account</h1>
          <p className="text-sm mb-7" style={{ color: '#5B6B63' }}>
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#1B5E20' }}>Create one free</Link>
          </p>

          {/* Demo accounts */}
          <div className="mb-6">
            <p className="text-xs font-medium mb-2" style={{ color: '#5B6B63' }}>Quick demo — click to fill credentials:</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(acc => (
                <button key={acc.email} onClick={() => fillDemo(acc)} type="button"
                  className="text-xs py-2 px-3 rounded-xl border border-dashed border-gray-300 hover:border-green-600 hover:bg-green-50 transition-colors text-left">
                  <div className="font-semibold" style={{ color: '#1B5E20' }}>{acc.label}</div>
                  <div style={{ color: '#5B6B63' }}>{acc.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl text-sm" style={{ background: '#F1F8F0', color: '#1B5E20' }}>
              <CheckCircle2 size={16} className="flex-shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>EMAIL ADDRESS</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@institution.edu.in"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold" style={{ color: '#5B6B63' }}>PASSWORD</label>
                <button type="button" className="text-xs font-medium hover:underline" style={{ color: '#1B5E20' }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                <input
                  type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
              style={{ background: '#1B5E20' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
