import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MessageSquareQuote, Mail, Lock, ShieldCheck,
  ArrowRight, CheckCircle2, Zap, TrendingUp, Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

const emailPasswordSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type EmailPasswordForm = z.infer<typeof emailPasswordSchema>;
type Tab = 'email' | 'otp';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens } = useAuthStore();

  const justRegistered = (location.state as any)?.registered === true;

  const [tab, setTab]     = useState<Tab>('email');
  const [error, setError] = useState<string | null>(null);

  // ── Email + password flow ─────────────────────────────────────────────────
  const [totpStep, setTotpStep]       = useState(false);
  const [totpCode, setTotpCode]       = useState('');
  const [totpLoading, setTotpLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmailPasswordForm>({
    resolver: zodResolver(emailPasswordSchema),
  });

  const onEmailSubmit = async (data: EmailPasswordForm) => {
    setError(null);
    try {
      const result = await authApi.login(data.email, data.password);
      if (result.requiresTwoFactor) {
        setCredentials({ email: data.email, password: data.password });
        setTotpStep(true);
        return;
      }
      setTokens(result);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Invalid email or password. Please try again.');
    }
  };

  const onTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials) return;
    setError(null); setTotpLoading(true);
    try {
      const result = await authApi.login(credentials.email, credentials.password, totpCode);
      setTokens(result); navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Invalid authentication code.');
    } finally { setTotpLoading(false); }
  };

  // ── Email OTP login flow ──────────────────────────────────────────────────
  const [otpEmail,     setOtpEmail]     = useState('');
  const [otpSent,      setOtpSent]      = useState(false);
  const [otp,          setOtp]          = useState('');
  const [otpSending,   setOtpSending]   = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const otpEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail);

  const onSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setOtpSending(true);
    try {
      await authApi.sendLoginEmailOtp(otpEmail.trim());
      setOtpSent(true); setOtp('');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Could not send code. Try again.');
    } finally { setOtpSending(false); }
  };

  const onVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setOtpVerifying(true);
    try {
      const result = await authApi.verifyLoginEmailOtp(otpEmail.trim(), otp.trim());
      setTokens(result); navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Invalid or expired code.');
    } finally { setOtpVerifying(false); }
  };

  function switchTab(t: Tab) {
    setTab(t); setError(null);
    setTotpStep(false); setOtpSent(false); setOtp(''); setOtpEmail('');
  }

  const headingText = totpStep
    ? 'Two-Factor Auth'
    : tab === 'email' ? 'Welcome back' : 'Login with Email OTP';
  const subText = totpStep
    ? 'Enter the code from your authenticator app'
    : tab === 'email'
      ? 'Sign in to your ReplyCart account'
      : "We'll send a one-time code to your email";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex">

      {/* ── Left panel — branding ────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-teal-700 to-teal-900 flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageSquareQuote className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">ReplyCart</span>
        </div>

        <div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-snug mb-4">
            Turn WhatsApp chats<br />into orders — effortlessly
          </h2>
          <p className="text-teal-200 text-sm leading-relaxed mb-8 max-w-sm">
            Manage your entire social selling business from one clean dashboard. Products, leads, orders and AI replies — all in one place.
          </p>
          <div className="space-y-3">
            {[
              { icon: <Zap className="w-4 h-4" />,        text: 'AI-powered WhatsApp reply suggestions' },
              { icon: <TrendingUp className="w-4 h-4" />, text: 'Real-time sales & revenue analytics' },
              { icon: <Users className="w-4 h-4" />,      text: 'Customer CRM & order management' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-teal-100 text-sm">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center shrink-0">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {[
            { stat: '500+', label: 'Active sellers' },
            { stat: '4.9★', label: 'Avg rating' },
            { stat: '₹2Cr+', label: 'Revenue tracked' },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl px-4 py-2.5 text-center">
              <p className="text-white font-bold text-sm">{s.stat}</p>
              <p className="text-teal-300 text-[11px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">

          {/* Logo (mobile only) */}
          <div className="flex lg:hidden flex-col items-center mb-6">
            <div className="w-12 h-12 bg-teal-700 rounded-2xl flex items-center justify-center mb-3">
              <MessageSquareQuote className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{headingText}</h1>
            <p className="text-slate-500 text-sm mt-0.5 text-center">{subText}</p>
          </div>

          {/* Heading (desktop) */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{headingText}</h1>
            <p className="text-slate-500 mt-1 text-sm">{subText}</p>
          </div>

          {/* Registration success banner */}
          {justRegistered && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Account created! 🎉</p>
                <p className="text-xs text-green-700 mt-0.5">Sign in below to access your dashboard.</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-8">

            {/* Tab switcher */}
            {!totpStep && (
              <div className="flex rounded-xl border border-slate-200 mb-5 overflow-hidden">
                {(['email', 'otp'] as Tab[]).map(t => (
                  <button key={t} type="button" onClick={() => switchTab(t)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                      tab === t ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    {t === 'email' ? 'Password' : 'Email OTP'}
                  </button>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
            )}

            {/* ── Email + password / TOTP ─────────────────────────────── */}
            {tab === 'email' && (
              !totpStep ? (
                <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
                  <Input label="Email address" type="email" placeholder="you@example.com"
                    leftIcon={<Mail className="w-4 h-4" />} error={errors.email?.message}
                    {...register('email')} />
                  <div>
                    <Input label="Password" type="password" placeholder="••••••••"
                      leftIcon={<Lock className="w-4 h-4" />} error={errors.password?.message}
                      {...register('password')} />
                    <div className="text-right mt-1">
                      <Link to="/forgot-password" className="text-xs text-teal-700 hover:underline">Forgot password?</Link>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-1" loading={isSubmitting} size="lg">
                    Sign in
                  </Button>
                </form>
              ) : (
                <form onSubmit={onTotpSubmit} className="space-y-4">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Authentication Code</label>
                    <input type="text" inputMode="numeric" maxLength={6}
                      value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000" autoFocus
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <Button type="submit" className="w-full" loading={totpLoading} size="lg" disabled={totpCode.length !== 6}>
                    Verify
                  </Button>
                  <button type="button"
                    onClick={() => { setTotpStep(false); setTotpCode(''); setError(null); }}
                    className="w-full text-sm text-slate-500 hover:text-slate-700"
                  >
                    ← Back to login
                  </button>
                </form>
              )
            )}

            {/* ── Email OTP login ─────────────────────────────────────── */}
            {tab === 'otp' && (
              !otpSent ? (
                <form onSubmit={onSendEmailOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={e => { setOtpEmail(e.target.value); setError(null); }}
                      placeholder="you@example.com"
                      autoFocus
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">
                      We'll send a 6-digit code to your registered email.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" loading={otpSending} size="lg"
                    disabled={!otpEmailValid}>
                    Send Code <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={onVerifyEmailOtp} className="space-y-4">
                  <div className="text-center mb-2">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-teal-600" />
                    </div>
                    <p className="text-sm text-slate-500">
                      Code sent to <span className="font-semibold text-slate-700">{otpEmail}</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Enter Code</label>
                    <input type="text" inputMode="numeric" maxLength={6}
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000" autoFocus
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-slate-400 mt-1.5 text-center">Valid for 10 minutes · Check spam if not received</p>
                  </div>
                  <Button type="submit" className="w-full" loading={otpVerifying} size="lg" disabled={otp.length < 6}>
                    Verify & Sign in
                  </Button>
                  <button type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); setError(null); }}
                    className="w-full text-sm text-slate-500 hover:text-slate-700"
                  >
                    ← Change email
                  </button>
                </form>
              )
            )}

            {!totpStep && (
              <p className="text-center text-sm text-slate-500 mt-5">
                Don't have an account?{' '}
                <Link to="/register" className="text-teal-700 font-medium hover:underline">Create one free</Link>
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
            {['500+ sellers', 'Free forever plan', '4.9★ rated'].map(t => (
              <span key={t} className="flex items-center gap-1 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
