import { useState, useEffect, useRef } from 'react';
import { X, Send, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';
import { submitPlatformLead, chatbotOnboard } from '../../api/platformLeads.api';

// ── Types ─────────────────────────────────────────────────────────────────────
// Flow: business → products → collect_email → collect_name → collect_business_name → collect_phone → creating → done
type Step =
  | 'welcome'
  | 'business'
  | 'products'
  | 'collect_email'
  | 'collect_name'
  | 'collect_business_name'
  | 'collect_phone'
  | 'creating'
  | 'done'
  | 'error';

interface Collected {
  businessType?: string;
  productCount?: string;
  email?: string;
  ownerName?: string;
  businessName?: string;
  phone?: string;
}

interface OnboardResult {
  slug: string;
  storeUrl: string;
  loginUrl: string;
  tempPassword: string;
}

const BUSINESS_TYPES = [
  { value: 'clothing',   label: '👗 Clothing & Fashion' },
  { value: 'food',       label: '🍱 Food & Beverages' },
  { value: 'beauty',     label: '💄 Beauty & Skincare' },
  { value: 'jewellery',  label: '💍 Jewellery & Accessories' },
  { value: 'home',       label: '🏠 Home & Decor' },
  { value: 'handicraft', label: '🪡 Handicrafts' },
  { value: 'other',      label: '📦 Something else' },
];

const PRODUCT_COUNTS = [
  { value: '1-10',  label: 'Just a few (1–10)' },
  { value: '11-50', label: 'Growing (11–50)' },
  { value: '50+',   label: 'Big catalogue (50+)' },
];

// Guess country from browser locale (best-effort, falls back to India)
function guessCountry(): string {
  const lang = navigator.language || '';
  if (lang.includes('en-IN') || lang.includes('hi'))    return 'India';
  if (lang.includes('en-US') || lang.includes('en-CA')) return lang.includes('CA') ? 'Canada' : 'United States';
  if (lang.includes('en-GB'))  return 'United Kingdom';
  if (lang.includes('en-AU'))  return 'Australia';
  if (lang.includes('en-SG'))  return 'Singapore';
  if (lang.includes('ar'))     return 'UAE';
  if (lang.includes('de'))     return 'Germany';
  if (lang.includes('fr'))     return 'France';
  if (lang.includes('ms'))     return 'Malaysia';
  return 'India'; // default
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Main widget ───────────────────────────────────────────────────────────────
export function LeadChatWidget() {
  const [open, setOpen]             = useState(false);
  const [step, setStep]             = useState<Step>('welcome');
  const [collected, setCollected]   = useState<Collected>({});
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [botTyping, setBotTyping]   = useState(false);
  const [result, setResult]         = useState<OnboardResult | null>(null);
  const [messages, setMessages]     = useState<{ from: 'bot' | 'user'; text: string }[]>([]);
  const [pulse, setPulse]           = useState(false);
  const [copied, setCopied]         = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const leadSavedRef = useRef(false);

  // Auto-open after 5 s (once per session)
  useEffect(() => {
    if (sessionStorage.getItem('rc_chat_opened')) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem('rc_chat_opened', '1');
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  // Ring immediately on mount, then every 5 s when closed
  useEffect(() => {
    if (open) return;
    // First ring after 1.5 s so it fires before auto-open
    const first = setTimeout(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    }, 1500);
    const t = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    }, 5000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botTyping, step]);

  // Focus input when text step starts
  useEffect(() => {
    if (['collect_email', 'collect_name', 'collect_business_name', 'collect_phone'].includes(step)) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step]);

  // Kick off conversation when opened
  useEffect(() => {
    if (!open || messages.length > 0) return;
    (async () => {
      await addBotMessage("👋 Hey there! I'm Reya, ReplyCart's assistant.", 500);
      await addBotMessage("I'll help you launch your own WhatsApp store in minutes — completely free! What kind of business do you run?", 1200);
      setStep('business');
    })();
  }, [open]);

  async function addBotMessage(text: string, delayMs = 700) {
    setBotTyping(true);
    await delay(delayMs);
    setBotTyping(false);
    setMessages(m => [...m, { from: 'bot', text }]);
  }

  function addUserMessage(text: string) {
    setMessages(m => [...m, { from: 'user', text }]);
  }

  // Save partial lead the moment we have an email — fire and forget
  async function saveLead(data: Collected) {
    if (leadSavedRef.current || !data.email) return;
    leadSavedRef.current = true;
    try {
      const params = new URLSearchParams(window.location.search);
      await submitPlatformLead({
        name:         data.ownerName ?? data.businessName ?? 'Visitor',
        email:        data.email,
        phone:        data.phone,
        businessType: data.businessType,
        productCount: data.productCount,
        source:       'chatbot',
        utmSource:    params.get('utm_source') ?? undefined,
        utmMedium:    params.get('utm_medium') ?? undefined,
        utmCampaign:  params.get('utm_campaign') ?? undefined,
      });
    } catch (e) { console.error('[LeadChatWidget] saveLead failed:', e); }
  }

  // ── Step handlers ─────────────────────────────────────────────────────────
  // Flow: business type → product count → EMAIL (lead saved) → name → business name → phone → CREATE

  async function handleBusinessType(value: string, label: string) {
    setCollected(c => ({ ...c, businessType: value }));
    addUserMessage(label);
    await addBotMessage('Nice! 🙌 How many products are you planning to list?', 700);
    setStep('products');
  }

  async function handleProductCount(value: string, label: string) {
    setCollected(c => ({ ...c, productCount: value }));
    addUserMessage(label);
    await addBotMessage("Let's get your store ready! What's your email address?", 800);
    setStep('collect_email');
  }

  // ① Email — save lead immediately so we never lose this visitor
  async function handleEmailSubmit() {
    const val = inputValue.trim().toLowerCase();
    if (!val || !val.includes('@')) { setInputError('Please enter a valid email'); return; }
    const updated = { ...collected, email: val };
    setCollected(updated);
    addUserMessage(val);
    setInputValue(''); setInputError('');
    // Fire-and-forget lead capture right now
    saveLead(updated);
    await addBotMessage("Got it! ✅ What's your name?", 600);
    setStep('collect_name');
  }

  // ② Name
  async function handleNameSubmit() {
    const val = inputValue.trim();
    if (!val) { setInputError('Please enter your name'); return; }
    setCollected(c => ({ ...c, ownerName: val }));
    addUserMessage(val);
    setInputValue(''); setInputError('');
    await addBotMessage(`Nice to meet you, ${val}! 👋 What's your business name?`, 600);
    setStep('collect_business_name');
  }

  // ③ Business name
  async function handleBusinessNameSubmit() {
    const val = inputValue.trim();
    if (!val) { setInputError('Please enter your business name'); return; }
    setCollected(c => ({ ...c, businessName: val }));
    addUserMessage(val);
    setInputValue(''); setInputError('');
    await addBotMessage(`Love it! 🚀 Last thing — your WhatsApp number?`, 600);
    setStep('collect_phone');
  }

  // ④ Phone → update lead with phone, then trigger store creation immediately
  async function handlePhoneSubmit() {
    const val = inputValue.trim();
    if (!val || val.replace(/\D/g, '').length < 6) { setInputError('Please enter a valid phone number'); return; }
    const updated = { ...collected, phone: val };
    setCollected(updated);
    addUserMessage(val);
    setInputValue(''); setInputError('');
    // Update the existing lead entry with the phone number (enriches the record)
    if (updated.email) {
      submitPlatformLead({
        name:         updated.ownerName ?? updated.businessName ?? 'Visitor',
        email:        updated.email,
        phone:        val,
        businessType: updated.businessType,
        productCount: updated.productCount,
        source:       'chatbot',
      }).catch(() => {});
    }
    // Create store immediately — country auto-detected from browser
    await doOnboard(updated);
  }

  async function doOnboard(data: Collected) {
    const country = guessCountry();
    setStep('creating');
    setMessages(m => [...m, { from: 'bot', text: "⚙️ Setting up your store right now…" }]);
    setBotTyping(true);
    setSubmitting(true);

    try {
      const res = await chatbotOnboard({
        businessName: data.businessName!,
        ownerName:    data.ownerName!,
        email:        data.email!,
        phone:        data.phone!,
        country,
        businessType: data.businessType,
      });
      setResult(res);
      setBotTyping(false);
      setMessages(m => [...m, { from: 'bot', text: `🎉 Your store is live! Here are your details:` }]);
      setStep('done');
    } catch (err: unknown) {
      setBotTyping(false);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg?.includes('already exists')) {
        setMessages(m => [...m, { from: 'bot', text: `👋 You already have an account! Log in at replycart.app/auth/login with your email.` }]);
      } else {
        setMessages(m => [...m, { from: 'bot', text: `Something went wrong on our end. Sign up at replycart.app/auth/register or chat with us below.` }]);
      }
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleStepSubmit();
  }

  function handleStepSubmit() {
    switch (step) {
      case 'collect_email':         return handleEmailSubmit();
      case 'collect_name':          return handleNameSubmit();
      case 'collect_business_name': return handleBusinessNameSubmit();
      case 'collect_phone':         return handlePhoneSubmit();
    }
  }

  function getInputPlaceholder() {
    switch (step) {
      case 'collect_email':         return 'your@email.com';
      case 'collect_name':          return 'Your full name…';
      case 'collect_business_name': return 'e.g. Priya Boutique';
      case 'collect_phone':         return '+91 98765 43210';
      default:                      return '';
    }
  }

  const isTextStep = ['collect_email', 'collect_name', 'collect_business_name', 'collect_phone'].includes(step);

  function copyPassword() {
    if (!result) return;
    navigator.clipboard.writeText(result.tempPassword).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleOpen = () => {
    setOpen(true);
    sessionStorage.setItem('rc_chat_opened', '1');
  };

  return (
    <>
      {/* ── Chat panel ────────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-4 z-50 w-80 sm:w-[360px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🤖</div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-teal-600 rounded-full" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Reya · ReplyCart Assistant</p>
            <p className="text-teal-100 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Online now
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/80">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {m.from === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-sm flex-shrink-0 mb-0.5">🤖</div>
              )}
              <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.from === 'user'
                  ? 'bg-teal-500 text-white rounded-br-sm'
                  : 'bg-white text-slate-800 shadow-sm rounded-bl-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {botTyping && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
              <div className="bg-white shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Business type chips */}
          {!botTyping && step === 'business' && (
            <div className="flex flex-wrap gap-2 pt-1 pl-9">
              {BUSINESS_TYPES.map(b => (
                <button key={b.value} onClick={() => handleBusinessType(b.value, b.label)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all shadow-sm active:scale-95">
                  {b.label}
                </button>
              ))}
            </div>
          )}

          {/* Product count chips */}
          {!botTyping && step === 'products' && (
            <div className="flex flex-wrap gap-2 pt-1 pl-9">
              {PRODUCT_COUNTS.map(p => (
                <button key={p.value} onClick={() => handleProductCount(p.value, p.label)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all shadow-sm active:scale-95">
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Loading spinner while creating */}
          {step === 'creating' && (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Done — store credentials card */}
          {step === 'done' && result && !botTyping && (
            <div className="ml-9 space-y-2">
              {/* Credentials card */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4 space-y-3 shadow-sm">
                <div>
                  <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider mb-0.5">Your Store URL</p>
                  <a href={result.storeUrl} target="_blank" rel="noreferrer"
                    className="text-sm font-bold text-teal-700 hover:underline flex items-center gap-1 break-all">
                    {result.storeUrl.replace('https://', '')}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Login Email</p>
                  <p className="text-sm text-slate-700 font-medium">{collected.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Temporary Password</p>
                  <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200">
                    <span className="text-sm font-mono font-bold text-slate-800 flex-1">{result.tempPassword}</span>
                    <button onClick={copyPassword}
                      className="text-teal-500 hover:text-teal-600 transition-colors flex-shrink-0">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <a href={result.loginUrl} target="_blank" rel="noreferrer"
                className="flex items-center justify-between bg-teal-500 text-white text-sm font-semibold px-4 py-3 rounded-2xl hover:bg-teal-600 transition-colors active:scale-95 shadow-lg shadow-teal-200 group">
                <span>Login to your store dashboard →</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a href="https://wa.me/918849549690?text=Hi%2C+I+just+set+up+my+store+on+ReplyCart!"
                target="_blank" rel="noreferrer"
                className="flex items-center justify-between bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <span>💬 Need help? Chat with us</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          )}

          {/* Error state */}
          {step === 'error' && !botTyping && (
            <div className="ml-9 space-y-2">
              <a href="/auth/register"
                className="flex items-center justify-between bg-teal-500 text-white text-sm font-semibold px-4 py-3 rounded-2xl hover:bg-teal-600 transition-colors active:scale-95">
                <span>Sign up manually →</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a href="https://wa.me/918849549690?text=Hi%2C+I+want+to+set+up+my+store+on+ReplyCart!"
                target="_blank" rel="noreferrer"
                className="flex items-center justify-between bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <span>💬 Chat with us on WhatsApp</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Text input (for name / email / phone / country steps) */}
        {isTextStep && !botTyping && (
          <div className="px-4 pb-3 pt-2 border-t border-slate-100 flex-shrink-0 bg-white">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={e => { setInputValue(e.target.value); setInputError(''); }}
                  onKeyDown={handleInputKeyDown}
                  placeholder={getInputPlaceholder()}
                  type={step === 'collect_email' ? 'email' : 'text'}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                    inputError ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {inputError && <p className="text-xs text-red-500 mt-1 px-1">{inputError}</p>}
              </div>
              <button
                onClick={handleStepSubmit}
                disabled={submitting}
                className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-colors disabled:opacity-50 flex-shrink-0 self-start mt-0.5"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer branding */}
        <div className="px-4 py-2 border-t border-slate-100 text-center flex-shrink-0">
          <p className="text-[10px] text-slate-400">Powered by <span className="font-semibold text-teal-600">ReplyCart</span></p>
        </div>
      </div>

      {/* ── Keyframe styles ───────────────────────────────────────────── */}
      <style>{`
        @keyframes phone-ring {
          0%,55%,100% { transform: rotate(0deg) scale(1); }
          5%  { transform: rotate(-18deg) scale(1.15); }
          10% { transform: rotate(18deg)  scale(1.15); }
          15% { transform: rotate(-14deg) scale(1.1); }
          20% { transform: rotate(14deg)  scale(1.1); }
          25% { transform: rotate(-9deg)  scale(1.05); }
          30% { transform: rotate(9deg)   scale(1.05); }
          35% { transform: rotate(-4deg)  scale(1); }
          40% { transform: rotate(4deg)   scale(1); }
          45% { transform: rotate(0deg)   scale(1); }
        }
        @keyframes ripple-1 {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes ripple-2 {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes ripple-3 {
          0%   { transform: scale(1);   opacity: 0.25; }
          100% { transform: scale(3.4); opacity: 0; }
        }
        @keyframes bubble-in {
          0%   { opacity:0; transform: translateY(8px) scale(0.9); }
          100% { opacity:1; transform: translateY(0)   scale(1); }
        }
        @keyframes bubble-out {
          0%   { opacity:1; transform: translateY(0)   scale(1); }
          100% { opacity:0; transform: translateY(8px) scale(0.9); }
        }
        .ring-anim      { animation: phone-ring 1.4s ease-in-out; }
        .ripple-ring-1  { animation: ripple-1 1.4s ease-out 0s   infinite; }
        .ripple-ring-2  { animation: ripple-2 1.4s ease-out 0.2s infinite; }
        .ripple-ring-3  { animation: ripple-3 1.4s ease-out 0.4s infinite; }
        .bubble-enter   { animation: bubble-in  0.35s ease forwards; }
        .bubble-exit    { animation: bubble-out 0.3s  ease forwards; }
      `}</style>

      {/* ── Floating button ───────────────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">

        {/* Preview bubble — shows when closed + after first ring */}
        {!open && pulse && (
          <div className="bubble-enter flex items-center gap-2.5 bg-white rounded-2xl rounded-br-sm shadow-xl border border-slate-100 px-4 py-3 mr-1 max-w-[220px]">
            <span className="text-xl flex-shrink-0">🤖</span>
            <div>
              <p className="text-xs font-semibold text-slate-800 leading-tight">Hey! Ready to launch?</p>
              <p className="text-[10px] text-teal-600 font-medium mt-0.5">Set up your store in 2 min →</p>
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => open ? setOpen(false) : handleOpen()}
          className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-200 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)' }}
          aria-label="Chat with us"
        >
          {/* Ripple rings when ringing */}
          {!open && pulse && (
            <>
              <span className="ripple-ring-1 absolute inset-0 rounded-full bg-teal-400" />
              <span className="ripple-ring-2 absolute inset-0 rounded-full bg-teal-300" />
              <span className="ripple-ring-3 absolute inset-0 rounded-full bg-teal-200" />
            </>
          )}

          {/* Unread badge */}
          {!open && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center z-10">1</span>
          )}

          {/* Icon — rings when pulsing */}
          <span className={`text-2xl select-none z-10 ${!open && pulse ? 'ring-anim' : ''}`}>
            {open ? '✕' : '💬'}
          </span>
        </button>
      </div>
    </>
  );
}
