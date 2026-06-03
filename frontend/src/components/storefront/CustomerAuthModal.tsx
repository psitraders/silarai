import { useState } from 'react';
import { X, User, Mail, Lock, Phone, Building2, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useStorefrontAuth } from '../../context/StorefrontAuthContext';

interface Props {
  slug: string;
  themeColor: string;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export function CustomerAuthModal({ slug, themeColor, onClose, defaultTab = 'login' }: Props) {
  const [tab, setTab]         = useState<'login' | 'register'>(defaultTab);
  const [isB2B, setIsB2B]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { login, register }   = useStorefrontAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd]     = useState('');

  // Register form state
  const [regName, setRegName]       = useState('');
  const [regEmail, setRegEmail]     = useState('');
  const [regPwd, setRegPwd]         = useState('');
  const [regPhone, setRegPhone]     = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regGst, setRegGst]         = useState('');

  const btn = { backgroundColor: themeColor };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(slug, loginEmail, loginPwd);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPwd.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(slug, {
        name: regName, email: regEmail, password: regPwd,
        phoneNumber: regPhone || undefined,
        isB2BCustomer: isB2B,
        companyName: isB2B ? regCompany : undefined,
        gstNumber: isB2B ? regGst : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  tab === t ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm px-3 py-2.5 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Login ─────────────────────────────────────────────────────── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field icon={Mail} label="Email" type="email" value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)} required />
              <Field icon={Lock} label="Password" type="password" value={loginPwd}
                onChange={e => setLoginPwd(e.target.value)} required />
              <button type="submit" disabled={loading} style={btn}
                className="w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
              <p className="text-center text-sm text-slate-500">
                No account?{' '}
                <button type="button" onClick={() => setTab('register')}
                  className="font-medium" style={{ color: themeColor }}>
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── Register ──────────────────────────────────────────────────── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <Field icon={User} label="Full Name" value={regName}
                onChange={e => setRegName(e.target.value)} required />
              <Field icon={Mail} label="Email" type="email" value={regEmail}
                onChange={e => setRegEmail(e.target.value)} required />
              <Field icon={Lock} label="Password (min 6 chars)" type="password" value={regPwd}
                onChange={e => setRegPwd(e.target.value)} required />
              <Field icon={Phone} label="Phone (optional)" type="tel" value={regPhone}
                onChange={e => setRegPhone(e.target.value)} />

              {/* B2B toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer py-1">
                <input type="checkbox" checked={isB2B}
                  onChange={e => setIsB2B(e.target.checked)}
                  className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-slate-700">
                  I'm a business buyer (B2B)
                </span>
              </label>

              {isB2B && (
                <>
                  <Field icon={Building2} label="Company Name" value={regCompany}
                    onChange={e => setRegCompany(e.target.value)} required />
                  <Field icon={FileText} label="GST Number (optional)" value={regGst}
                    onChange={e => setRegGst(e.target.value)} />
                </>
              )}

              <button type="submit" disabled={loading} style={btn}
                className="w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </button>
              {isB2B && (
                <p className="text-xs text-slate-500 text-center">
                  B2B accounts may require approval before accessing wholesale pricing.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────

function Field({
  icon: Icon, label, type = 'text', value, onChange, required,
}: {
  icon: React.ElementType;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type={type}
        placeholder={label}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
      />
    </div>
  );
}
