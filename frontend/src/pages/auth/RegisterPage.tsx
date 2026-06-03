import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MessageSquareQuote, CheckCircle, ArrowRight, ArrowLeft,
  Globe, ChevronDown, CheckCircle2, ShoppingBag, BarChart2, Zap, Mail,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth.api';
import { COUNTRIES, SUPPORTED_LANGUAGES } from '../../data/countries';
import { track } from '../../lib/analytics';

// Flag emoji from ISO-3166 alpha-2 code (e.g. 'IN' → '🇮🇳')
const countryFlag = (code: string) =>
  [...code.toUpperCase()].map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('');

// Detect the visitor's most likely country from browser timezone / locale.
const TIMEZONE_COUNTRY: Record<string, string> = {
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW', 'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM',
  'Asia/Amman': 'JO', 'Africa/Cairo': 'EG', 'Africa/Casablanca': 'MA',
  'Africa/Tunis': 'TN',
  'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Colombo': 'LK',
  'Asia/Kathmandu': 'NP',
  'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Jakarta': 'ID',
  'Asia/Manila': 'PH', 'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Seoul': 'KR', 'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'HK',
  'Europe/London': 'GB', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR',
  'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Istanbul': 'TR',
  'Europe/Amsterdam': 'NL', 'Europe/Warsaw': 'PL',
  'America/New_York': 'US', 'America/Los_Angeles': 'US',
  'America/Chicago': 'US', 'America/Denver': 'US', 'America/Phoenix': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX',
  'America/Bogota': 'CO', 'America/Lima': 'PE', 'America/Santiago': 'CL',
  'America/Argentina/Buenos_Aires': 'AR',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Pacific/Auckland': 'NZ',
  'Africa/Johannesburg': 'ZA', 'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE',
};

function detectCountryCode(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fromTz = TIMEZONE_COUNTRY[tz];
  if (fromTz && COUNTRIES.find(c => c.code === fromTz)) return fromTz;
  const lang = navigator.language ?? '';
  const parts = lang.split('-');
  if (parts.length >= 2) {
    const code = parts[parts.length - 1].toUpperCase();
    if (COUNTRIES.find(c => c.code === code)) return code;
  }
  return 'IN';
}

const step1Schema = z.object({
  businessName : z.string().min(2, 'Business name must be at least 2 characters'),
  ownerName    : z.string().min(2, 'Your name is required'),
  email        : z.string().email('Enter a valid email'),
  password     : z.string().min(8, 'Password must be at least 8 characters'),
  phone        : z.string().min(1, 'Mobile number is required')
    .refine(v => v.replace(/\D/g, '').length >= 6, 'Enter a valid mobile number'),
});
type Step1Data = z.infer<typeof step1Schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError]               = useState<string | null>(null);
  const [currentStep, setCurrentStep]   = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email OTP state
  const [emailOtpSent,    setEmailOtpSent]    = useState(false);
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailOtp,        setEmailOtp]        = useState('');
  const [emailOtpChecking,setEmailOtpChecking]= useState(false);
  const [emailVerified,   setEmailVerified]   = useState(false);

  // Country / locale — auto-detected from browser
  const [countryCode, setCountryCode] = useState(() => detectCountryCode());
  const [language,    setLanguage]    = useState(() => {
    const code = detectCountryCode();
    return COUNTRIES.find(c => c.code === code)?.language ?? 'en';
  });
  const [currency, setCurrency] = useState(() => {
    const code = detectCountryCode();
    return COUNTRIES.find(c => c.code === code)?.currency ?? 'INR';
  });

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0];

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  const emailValue  = watch('email') ?? '';
  const ownerName   = watch('ownerName') ?? '';
  const phoneValue  = watch('phone') ?? '';
  const phoneDigits = phoneValue.replace(/\D/g, '');
  const step1Data   = watch();

  // Email is valid enough to send OTP?
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  function handleCountryChange(code: string) {
    const c = COUNTRIES.find(x => x.code === code);
    if (!c) return;
    setCountryCode(code);
    setLanguage(c.language);
    setCurrency(c.currency);
  }

  // Reset email verification when the email field changes
  function onEmailChange() {
    if (emailVerified) {
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp('');
    }
  }

  async function handleSendEmailOtp() {
    if (!emailLooksValid) return;
    setError(null); setEmailOtpSending(true);
    try {
      await authApi.sendRegistrationEmailOtp(emailValue.trim(), ownerName || undefined);
      setEmailOtpSent(true); setEmailOtp(''); setEmailVerified(false);
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Could not send verification email. Try again.');
    } finally { setEmailOtpSending(false); }
  }

  async function handleVerifyEmailOtp() {
    if (emailOtp.length < 6) return;
    setError(null); setEmailOtpChecking(true);
    try {
      await authApi.verifyRegistrationEmailOtp(emailValue.trim(), emailOtp);
      setEmailVerified(true);
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Invalid or expired code.');
    } finally { setEmailOtpChecking(false); }
  }

  const onStep1Valid = async () => {
    if (!emailVerified) {
      setError('Please verify your email address with the code we sent. 📧');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  async function handleFinalSubmit() {
    setError(null); setIsSubmitting(true);
    track.registerSubmit();
    try {
      const fullPhone = selectedCountry.dialCode.replace('+', '') + phoneDigits;
      await authApi.register({
        businessName: step1Data.businessName,
        ownerName:    step1Data.ownerName,
        email:        step1Data.email,
        password:     step1Data.password,
        phone:        fullPhone,
        country:      selectedCountry.name,
        language,
        currency,
      });
      track.registerSuccess();
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Registration failed. Please try again.');
      setCurrentStep(1);
    } finally { setIsSubmitting(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex">

      {/* ── Left panel — branding (tablet+) ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-teal-700 to-teal-900 flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageSquareQuote className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Silarai</span>
        </div>

        <div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-snug mb-4">
            Your store, live in<br />under 5 minutes ✨
          </h2>
          <p className="text-teal-200 text-sm leading-relaxed mb-8 max-w-sm">
            Join 500+ sellers worldwide who manage their WhatsApp, Instagram and Facebook orders in one clean dashboard.
          </p>
          <div className="space-y-3">
            {[
              { icon: <ShoppingBag className="w-4 h-4" />, text: 'Beautiful storefront with your own link' },
              { icon: <Zap className="w-4 h-4" />,         text: 'AI-powered reply suggestions' },
              { icon: <BarChart2 className="w-4 h-4" />,   text: 'Real-time orders & revenue analytics' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-teal-100 text-sm">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center shrink-0">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-white text-xs font-semibold mb-1">Free plan — no credit card needed</p>
          <p className="text-teal-300 text-xs">Upgrade anytime as your business grows.</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {['50 products', '100 leads/mo', 'Storefront link', 'Order management'].map(f => (
              <span key={f} className="flex items-center gap-1 text-[11px] bg-white/10 text-teal-100 px-2 py-1 rounded-lg">
                <CheckCircle2 className="w-3 h-3 text-teal-300" /> {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-lg py-6 sm:py-0">

          {/* Logo + heading (mobile) */}
          <div className="flex lg:hidden flex-col items-center mb-5">
            <div className="w-12 h-12 bg-teal-700 rounded-2xl flex items-center justify-center mb-3">
              <MessageSquareQuote className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Create your free store</h1>
            <p className="text-slate-500 text-sm mt-0.5">Ready in 2 minutes · No credit card</p>
          </div>

          {/* Heading (desktop) */}
          <div className="hidden lg:block mb-5">
            <h1 className="text-2xl font-bold text-slate-900">Start selling smarter</h1>
            <p className="text-slate-500 mt-1 text-sm">Create your Silarai store in 2 minutes</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-5">
            {[{ n: 1, label: 'Account' }, { n: 2, label: 'Location' }].map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep > s.n  ? 'bg-teal-600 text-white' :
                    currentStep === s.n ? 'bg-teal-600 text-white ring-4 ring-teal-100' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {currentStep > s.n ? '✓' : s.n}
                  </div>
                  <span className={`text-xs font-semibold ${currentStep === s.n ? 'text-teal-700' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i === 0 && <div className={`w-8 sm:w-12 h-px mx-2 sm:mx-3 ${currentStep > 1 ? 'bg-teal-500' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-7">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
            )}

            {/* ── STEP 1: Account ──────────────────────────────────────── */}
            {currentStep === 1 && (
              <form onSubmit={handleSubmit(onStep1Valid)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Business Name" placeholder="Neha Boutique"
                    error={errors.businessName?.message} required {...register('businessName')} />
                  <Input label="Your Name" placeholder="Neha Sharma"
                    error={errors.ownerName?.message} required {...register('ownerName')} />
                </div>

                {/* ── Email + OTP inline ───────────────────────────────── */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="neha@example.com"
                      className={`flex-1 min-w-0 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.email ? 'border-red-300' : emailVerified ? 'border-green-400' : 'border-slate-200'
                      }`}
                      {...register('email', { onChange: onEmailChange })}
                    />
                    {/* Send/Resend code button */}
                    {!emailVerified && (
                      <button type="button" onClick={handleSendEmailOtp}
                        disabled={!emailLooksValid || emailOtpSending}
                        className="shrink-0 px-3 py-2.5 rounded-xl border border-teal-600 text-teal-700 text-xs sm:text-sm font-medium hover:bg-teal-50 disabled:opacity-40 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {emailOtpSending
                          ? <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                          : <Mail className="w-4 h-4 shrink-0" />}
                        <span>{emailOtpSent ? 'Resend' : 'Send Code'}</span>
                      </button>
                    )}
                    {/* Verified badge */}
                    {emailVerified && (
                      <div className="shrink-0 flex items-center gap-1.5 px-2 sm:px-3 text-green-600 text-xs sm:text-sm font-medium whitespace-nowrap">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}

                  {/* OTP input — shown after code is sent */}
                  {emailOtpSent && !emailVerified && (
                    <>
                      <div className="mt-3 flex gap-2">
                        <input type="text" inputMode="numeric" maxLength={6}
                          value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 6-digit code"
                          className="flex-1 min-w-0 border border-slate-200 rounded-xl px-3 py-2.5 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500"
                          autoFocus
                        />
                        <button type="button" onClick={handleVerifyEmailOtp}
                          disabled={emailOtp.length < 6 || emailOtpChecking}
                          className="shrink-0 px-3 sm:px-4 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                        >
                          {emailOtpChecking
                            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <ArrowRight className="w-4 h-4" />}
                          <span className="hidden sm:inline">Verify</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">
                        Code sent to <strong>{emailValue}</strong> · Valid 10 min · Check spam if not received
                      </p>
                    </>
                  )}

                  {/* Prompt to send code if email looks valid but not yet sent */}
                  {!emailOtpSent && !emailVerified && emailLooksValid && (
                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-teal-500" />
                      Click <strong>Send Code</strong> to verify your email address
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <select
                        value={countryCode}
                        onChange={e => handleCountryChange(e.target.value)}
                        className="h-full appearance-none pl-2.5 pr-7 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                        style={{ minWidth: '72px' }}
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>
                            {countryFlag(c.code)} {c.dialCode}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={15}
                      placeholder="Mobile number"
                      className={`flex-1 min-w-0 border rounded-r-xl px-2.5 sm:px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.phone ? 'border-red-300' : 'border-slate-200'
                      }`}
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>

                <Input label="Password" type="password" placeholder="Min. 8 characters"
                  error={errors.password?.message} required {...register('password')} />

                <Button
                  type="submit"
                  className="w-full mt-1"
                  size="lg"
                  disabled={!emailVerified}
                >
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                {!emailVerified && (
                  <p className="text-xs text-center text-slate-400">Verify your email above to continue.</p>
                )}
              </form>
            )}

            {/* ── STEP 2: Location ─────────────────────────────────────── */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-1">
                  <Globe className="w-7 h-7 text-teal-600 mx-auto mb-2" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Where is your store based?</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    We'll set your language and currency automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select value={countryCode} onChange={e => handleCountryChange(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none pr-8"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {countryFlag(c.code)} {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Language</label>
                    <div className="relative">
                      <select value={language} onChange={e => setLanguage(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none pr-8"
                      >
                        {SUPPORTED_LANGUAGES.map(l => (
                          <option key={l.code} value={l.code}>{l.nativeLabel} — {l.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
                    <div className="relative">
                      <select value={currency} onChange={e => setCurrency(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none pr-8"
                      >
                        {Array.from(new Map(COUNTRIES.map(c => [c.currency, c])).values()).map(c => (
                          <option key={c.currency} value={c.currency}>
                            {c.currency} — {c.currencySymbol}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400">Auto-selected for your country. You can change anytime in Settings.</p>

                {/* Summary */}
                <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center shrink-0 text-xl">
                    {countryFlag(countryCode)}
                  </div>
                  <div className="text-sm min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{selectedCountry.name}</p>
                    <p className="text-slate-500 text-xs">
                      {SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeLabel ?? language} · {currency}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <Button onClick={handleFinalSubmit} loading={isSubmitting} className="flex-1" size="lg">
                    Create My Store — Free
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-slate-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-700 font-medium hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {['No credit card', 'Free forever plan', 'Cancel anytime'].map(t => (
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

