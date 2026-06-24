'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Recycle, Eye, EyeOff, Mail, Lock, User, Building2,
  Briefcase, Phone, AlertCircle, CheckCircle2, Loader2, Check, X, FileText
} from 'lucide-react';

const roles = [
  { value: 'buyer',     label: 'Verified Buyer',    desc: 'Browse & bid on oil/e-waste listings' },
  { value: 'dept_head', label: 'Resource Seller',   desc: 'List oil & e-waste, manage pickups' },
  { value: 'recycler',  label: 'Recycler Partner',  desc: 'Handle e-waste collections & pickups' },
];

const departments = [
  'Hostel Mess', 'Mechanical Dept.', 'Computer Lab', 'Admin Block',
  'Sports Complex', 'Chemistry Lab', 'Canteen', 'Other',
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number',     ok: /\d/.test(password) },
    { label: 'Contains uppercase',    ok: /[A-Z]/.test(password) },
    { label: 'Contains special char', ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#DC2626', '#F59E0B', '#F59E0B', '#1B5E20', '#1B5E20'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i < score ? colors[score] : '#E5E7EB' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: colors[score] }}>{labels[score]}</span>
      </div>
      <div className="mt-2 space-y-1">
        {checks.map(({ label, ok }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: ok ? '#1B5E20' : '#9CA3AF' }}>
            {ok ? <Check size={11} /> : <X size={11} />} {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    password: '', confirmPassword: '',
    role: '', institution: 'Symbiosis University of Applied Sciences',
    department: '', city: 'Indore',
    docType: 'fssai', docName: ''
  });

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const validateStep1 = () => {
    if (!form.name.trim()) { setError('Please enter your full name.'); return false; }
    if (!form.email.trim()) { setError('Please enter your email.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email.'); return false; }
    if (form.phone && !/^\+?[\d\s-]{10,}$/.test(form.phone)) { setError('Please enter a valid phone number.'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!form.role) { setError('Please select your role.'); return false; }
    if (!form.institution.trim()) { setError('Please enter your institution name.'); return false; }
    return true;
  };

  const validateStep3 = () => {
    if (!form.password) { setError('Please enter a password.'); return false; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return false; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return false; }
    return true;
  };

  const validateStepUpload = () => {
    if (!form.docName) { setError('Please upload your registration document.'); return false; }
    return true;
  };

  const getFinalStep = () => form.role === 'buyer' ? 4 : 3;

  const goNext = () => {
    setError('');
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) {
      if (form.role === 'buyer') setStep(3); // Go to upload step
      else setStep(3); // Wait, if buyer goes to 3 (upload), then non-buyer goes to 3 (password). So password is step 3 for non-buyers, step 4 for buyers.
      // Wait, let's keep password as step 3, and make upload step 2.5? No, integer is better.
      // Let's adjust step numbers: if buyer, step 3 is upload, step 4 is password. If not, step 3 is password.
      if (form.role === 'buyer') setStep(3);
      else setStep(4);
    }
    else if (step === 3 && form.role === 'buyer' && validateStepUpload()) setStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          institution: form.institution,
          department: form.department,
          phone: form.phone,
          docType: form.role === 'buyer' ? form.docType : undefined,
          docName: form.role === 'buyer' ? form.docName : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed. Please try again.');
      } else {
        localStorage.setItem('reloop_user', JSON.stringify(data.user));
        router.push('/dashboard');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
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
            Join the circular<br />economy today.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-10">
            Start converting your campus waste streams into revenue in under 5 minutes. No hardware. No setup cost.
          </p>

          {/* Steps indicator */}
          <div className="space-y-4">
            {[
              { n: 1, label: 'Personal Details',  desc: 'Your name, email & phone' },
              { n: 2, label: 'Role & Institution', desc: 'How you will use ReLoop' },
              ...(form.role === 'buyer' ? [{ n: 3, label: 'Compliance Docs', desc: 'FSSAI or CPCB verification' }] : []),
              { n: form.role === 'buyer' ? 4 : 3, label: 'Set Password',       desc: 'Secure your account' },
            ].map(({ n, label, desc }) => (
              <div key={n} className={`flex items-center gap-4 transition-opacity ${step >= n ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  step > n ? 'bg-amber-400 text-white' : step === n ? 'bg-white text-green-900' : 'bg-white/20 text-white'
                }`}>
                  {step > n ? <Check size={14} /> : n}
                </div>
                <div>
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-xs text-white/60">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/50 text-xs">Team EcoNova · Symbiosis University of Applied Sciences, Indore</div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#1B5E20' }}>
              <Recycle size={18} color="white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#1B5E20' }}>ReLoop</span>
          </div>

          {/* Mobile steps */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            {[1,2,3].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > n ? 'text-white' : step === n ? 'text-white' : 'text-gray-400 border border-gray-200'
                }`} style={{ background: step >= n ? '#1B5E20' : 'transparent' }}>
                  {step > n ? <Check size={12} /> : n}
                </div>
                {n < 3 && <div className="flex-1 h-0.5 w-8" style={{ background: step > n ? '#1B5E20' : '#E5E7EB' }} />}
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: '#1F2A24', fontFamily: 'Georgia, serif' }}>
            {step === 1 ? 'Create your account' : step === 2 ? 'Your role & institution' : step === 3 && form.role === 'buyer' ? 'Upload Compliance' : 'Set your password'}
          </h1>
          <p className="text-sm mb-7" style={{ color: '#5B6B63' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: '#1B5E20' }}>Sign in</Link>
          </p>

          {error && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <AlertCircle size={16} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={step === getFinalStep() ? handleSubmit : (e) => { e.preventDefault(); goNext(); }}>

            {/* ── STEP 1: Personal Details ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>FULL NAME *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                    <input value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="e.g. Suraj Upadhyay"
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>EMAIL ADDRESS *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="you@institution.edu.in"
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>PHONE NUMBER <span className="font-normal text-gray-400">(optional)</span></label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 transition-all" />
                  </div>
                </div>

                <button type="submit"
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
                  Continue →
                </button>
              </div>
            )}

            {/* ── STEP 2: Role & Institution ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: '#5B6B63' }}>SELECT YOUR ROLE *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map(r => (
                      <button key={r.value} type="button" onClick={() => set('role', r.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          form.role === r.value
                            ? 'border-green-700 bg-green-50'
                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }`}>
                        <div className="text-sm font-semibold" style={{ color: form.role === r.value ? '#1B5E20' : '#1F2A24' }}>{r.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#5B6B63' }}>{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>INSTITUTION NAME *</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                    <input value={form.institution} onChange={e => set('institution', e.target.value)}
                      placeholder="e.g. Symbiosis University"
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>DEPARTMENT <span className="font-normal text-gray-400">(optional)</span></label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                    <select value={form.department} onChange={e => set('department', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-700 bg-white appearance-none">
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50" style={{ color: '#5B6B63' }}>
                    ← Back
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Compliance (Buyer Only) ── */}
            {step === 3 && form.role === 'buyer' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>DOCUMENT TYPE *</label>
                  <div className="flex gap-4 p-4 border border-gray-200 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="docType" checked={form.docType === 'fssai'} onChange={() => set('docType', 'fssai')} className="accent-green-700" />
                      <span className="text-sm font-medium" style={{ color: '#1F2A24' }}>FSSAI License</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="docType" checked={form.docType === 'cpcb'} onChange={() => set('docType', 'cpcb')} className="accent-green-700" />
                      <span className="text-sm font-medium" style={{ color: '#1F2A24' }}>CPCB Registration</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>UPLOAD CERTIFICATE *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer"
                       onClick={() => {
                         const fileNames = ['registration_cert.pdf', 'license_copy_2026.pdf', 'cpcb_auth.png'];
                         set('docName', fileNames[Math.floor(Math.random() * fileNames.length)]);
                       }}>
                    <FileText size={28} className="text-gray-400 mb-3" />
                    {form.docName ? (
                      <div className="text-sm font-semibold text-green-700">{form.docName}</div>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-gray-700">Click to upload document</div>
                        <div className="text-xs text-gray-400 mt-1">Simulated upload (PDF, JPG or PNG)</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50" style={{ color: '#5B6B63' }}>
                    ← Back
                  </button>
                  <button type="button" onClick={goNext} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── FINAL STEP: Password ── */}
            {step === getFinalStep() && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>CREATE PASSWORD *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                    <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-11 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 transition-all" />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5B6B63' }}>CONFIRM PASSWORD *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
                    <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full pl-10 pr-11 py-3 text-sm border rounded-xl outline-none focus:ring-2 transition-all ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : form.confirmPassword && form.password === form.confirmPassword
                          ? 'border-green-400 focus:border-green-600 focus:ring-green-100'
                          : 'border-gray-200 focus:border-green-700 focus:ring-green-100'
                      }`} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <CheckCircle2 size={16} className="absolute right-9 top-1/2 -translate-y-1/2" style={{ color: '#1B5E20' }} />
                    )}
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs mt-1" style={{ color: '#DC2626' }}>Passwords do not match</p>
                  )}
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl text-sm space-y-1" style={{ background: '#F1F8F0' }}>
                  <div className="font-semibold mb-2" style={{ color: '#1B5E20' }}>Account Summary</div>
                  <div style={{ color: '#5B6B63' }}><span className="font-medium text-gray-700">Name:</span> {form.name}</div>
                  <div style={{ color: '#5B6B63' }}><span className="font-medium text-gray-700">Email:</span> {form.email}</div>
                  <div style={{ color: '#5B6B63' }}><span className="font-medium text-gray-700">Role:</span> {roles.find(r => r.value === form.role)?.label}</div>
                  <div style={{ color: '#5B6B63' }}><span className="font-medium text-gray-700">Institution:</span> {form.institution}</div>
                  {form.department && <div style={{ color: '#5B6B63' }}><span className="font-medium text-gray-700">Dept:</span> {form.department}</div>}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(form.role === 'buyer' ? 3 : 2)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50" style={{ color: '#5B6B63' }}>
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{ background: '#1B5E20' }}>
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
