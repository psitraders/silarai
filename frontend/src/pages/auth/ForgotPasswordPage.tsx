import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquareQuote, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth.api';

type Step = 'email' | 'otp' | 'password' | 'done';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep]         = useState<Step>('email');
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ── Step 1: send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setStep('otp');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Step 2: verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const { token } = await authApi.verifyResetOtp(email.trim(), otp.trim());
      setResetToken(token);
      setStep('password');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Invalid or expired code.');
    } finally { setLoading(false); }
  };

  // ── Step 3: set new password ───────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, password);
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Something went wrong. Please start over.');
    } finally { setLoading(false); }
  };

  const stepLabel = step === 'email' ? 'Reset your password'
    : step === 'otp'      ? 'Enter verification code'
    : step === 'password' ? 'Set new password'
    : 'Password changed!';

  const stepSub = step === 'email'    ? "We'll send a 6-digit code to your email"
    : step === 'otp'      ? `Code sent to ${email}`
    : step === 'password' ? 'Choose a strong new password'
    : 'You can now sign in with your new password';

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-700 rounded-2xl mb-4">
            <MessageSquareQuote className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{stepLabel}</h1>
          <p className="text-slate-500 mt-1 text-sm">{stepSub}</p>
        </div>

        {/* Step dots */}
        {step !== 'done' && (
          <div className="flex justify-center gap-2 mb-6">
            {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${
                step === s ? 'w-6 bg-teal-600' :
                ['email','otp','password'].indexOf(step) > i ? 'w-4 bg-teal-300' : 'w-4 bg-slate-200'
              }`} />
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          {/* ── Step 1: Email ─────────────────────────────────────────── */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" loading={loading} size="lg">
                Send Code <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Link to="/login"
                className="flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                ← Back to sign in
              </Link>
            </form>
          )}

          {/* ── Step 2: OTP ───────────────────────────────────────────── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">6-digit code</label>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000" autoFocus
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-slate-400 mt-1.5 text-center">
                  Valid for 10 minutes · Check spam if not received
                </p>
              </div>
              <Button type="submit" className="w-full" loading={loading} size="lg" disabled={otp.length < 6}>
                Verify Code <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(null); }}
                className="w-full text-sm text-slate-500 hover:text-slate-700 text-center">
                ← Change email
              </button>
            </form>
          )}

          {/* ── Step 3: New password ───────────────────────────────────── */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="New password"
                type="password"
                placeholder="Min 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Re-enter new password"
                leftIcon={<Lock className="w-4 h-4" />}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" loading={loading} size="lg"
                disabled={password.length < 8 || password !== confirm}>
                Reset Password
              </Button>
            </form>
          )}

          {/* ── Done ──────────────────────────────────────────────────── */}
          {step === 'done' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Password changed!</p>
                <p className="text-sm text-slate-500 mt-1">You can now sign in with your new password.</p>
              </div>
              <Button className="w-full" onClick={() => navigate('/login')} size="lg">
                Sign in now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
