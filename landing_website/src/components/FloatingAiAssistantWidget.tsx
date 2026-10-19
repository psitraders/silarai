import React, { useState, useEffect, useRef } from 'react';
import { processClientAssistantMessage } from '../lib/clientAiAssistant';
import { CONTACT_EMAIL, buildMailtoUrl, openMailClient } from '../config/forms';
import {
  Bot,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Check,
  ShoppingCart,
  Phone,
  Mail,
  User,
  ExternalLink,
  Copy,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Store,
  Zap,
  Building,
  ChevronRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user' | 'system';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  showLeadForm?: boolean;
  leadSubmitted?: {
    name: string;
    email: string;
    phone: string;
    targetEmail: string;
    timestamp: string;
  };
}

export const FloatingAiAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'lead'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: "👋 Welcome to SilarAI! I am your AI Commerce & Shopping Assistant.\n\nI can help you with:\n• Building a high-speed AI ecommerce store\n• Deploying conversational Shopping Assistants for your catalog\n• Integrating with Shopify, SAP, WooCommerce, or custom ERPs\n• Drafting an enquiry email to our solutions team\n\nWhat would you like to explore today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'How do I build an ecommerce store with SilarAI?',
        'How does the AI Shopping Assistant work?',
        'Shopify, SAP & ERP integration',
        'Can it handle 50,000+ SKUs?',
        'Talk to sales / Request a quote',
      ],
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedLead, setCopiedLead] = useState(false);

  // Dedicated Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadInquiry, setLeadInquiry] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [leadErrorMessage, setLeadErrorMessage] = useState('');
  const [lastSubmittedLead, setLastSubmittedLead] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Single source of truth for the enquiries inbox — see src/config/forms.ts.
  const targetEmail = CONTACT_EMAIL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Listen for global custom event to open chat widget from anywhere in the app
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      setIsOpen(true);
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.tab === 'lead') {
        setActiveTab('lead');
      } else {
        setActiveTab('chat');
      }
      if (customEvent.detail?.question) {
        handleSendMessage(customEvent.detail.question);
      }
    };

    window.addEventListener('open-silarai-chat', handleOpenChat);
    return () => {
      window.removeEventListener('open-silarai-chat', handleOpenChat);
    };
  }, []);

  const handleSendMessage = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setIsLoading(true);

    // Pure client-side intelligent assistant processing with zero backend dependency
    setTimeout(() => {
      const response = processClientAssistantMessage(cleanText);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: response.suggestedQuestions,
        showLeadForm:
          response.promptLeadForm ||
          cleanText.toLowerCase().includes('quote') ||
          cleanText.toLowerCase().includes('price') ||
          cleanText.toLowerCase().includes('contact') ||
          cleanText.toLowerCase().includes('sales'),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 200);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim() || !leadPhone.trim()) {
      setLeadErrorMessage('Please fill in your Name, Email, and Phone number.');
      return;
    }

    setLeadStatus('submitting');
    setLeadErrorMessage('');

    const payload = {
      name: leadName.trim(),
      email: leadEmail.trim(),
      phone: leadPhone.trim(),
      inquiry: leadInquiry.trim() || 'Inquiry regarding building an ecommerce store and AI Shopping Assistant with SilarAI',
      source: 'SilarAI Floating Live Chat Widget',
      timestamp: new Date().toISOString(),
      recipient: targetEmail,
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    // Device-local convenience copy only — nobody at SilarAI can read this.
    try {
      const existing = JSON.parse(localStorage.getItem('silarai_leads') || '[]');
      existing.unshift(payload);
      localStorage.setItem('silarai_leads', JSON.stringify(existing.slice(0, 50)));
    } catch (err) {
      console.warn('Storage save skipped:', err);
    }

    // Hand off to the visitor's own mail client. Nothing is delivered until they press Send.
    if (!openMailClient(generateMailtoUrl(payload))) {
      setLeadStatus('error');
      setLeadErrorMessage(`We couldn't open your mail app. Please email ${targetEmail} directly.`);
      return;
    }

    setLastSubmittedLead(payload);
    setLeadStatus('success');

    // Add confirmation message to chat feed
    const confirmationMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: `📝 Your enquiry has been drafted in your mail app, addressed to ${targetEmail}.\n\n• Name: ${payload.name}\n• Email: ${payload.email}\n• Phone: ${payload.phone}\n\nPlease press Send in your mail app to deliver it — nothing has been sent yet.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      leadSubmitted: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        targetEmail,
        timestamp: new Date().toLocaleString(),
      },
    };

    setMessages((prev) => [...prev, confirmationMsg]);
    setActiveTab('chat');
  };

  const generateMailtoUrl = (lead?: any) => {
    const name = lead?.name || leadName || 'Valued Customer';
    const email = lead?.email || leadEmail || 'customer@example.com';
    const phone = lead?.phone || leadPhone || 'Pending';
    const inquiry = lead?.inquiry || leadInquiry || 'Inquiry regarding SilarAI Ecommerce Store and AI Shopping Assistant';

    return buildMailtoUrl(`SilarAI Inquiry - ${name} (${phone})`, [
      'Hello SilarAI Sales Team,',
      '',
      'I am inquiring about building an ecommerce store and deploying the SilarAI Shopping Assistant.',
      '',
      'Customer Details:',
      `• Full Name: ${name}`,
      `• Work Email: ${email}`,
      `• Phone Number: ${phone}`,
      `• Requirements / Questions: ${inquiry}`,
      '',
      'Please contact me with a product demo and tailored architecture proposal.',
      '',
      'Sent via SilarAI Live Assistant.',
    ]);
  };

  const copyToClipboard = (text: string, type: 'email' | 'lead') => {
    navigator.clipboard?.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedLead(true);
      setTimeout(() => setCopiedLead(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Trigger Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-plum-900 via-plum-800 to-plum-900 hover:from-plum-800 hover:to-plum-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-[0_10px_35px_-5px_rgba(46,16,101,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(46,16,101,0.7)] hover:scale-105 active:scale-95 transition-all duration-200 border border-plum-600/50"
          aria-label="Open SilarAI Live Chat Assistant"
        >
          <div className="relative w-7 h-7 rounded-full bg-peach-400 text-plum-950 flex items-center justify-center font-black shadow-inner">
            <Bot className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-plum-900 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span>Test SilarAI AI Live</span>
              <Sparkles className="w-3.5 h-3.5 text-peach-300 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="text-[10px] text-plum-200 font-normal mt-0.5 opacity-90">Store & Shopping Assistant</div>
          </div>
        </button>
      ) : (
        /* Chat & Lead Panel */
        <div className="w-[92vw] sm:w-[420px] bg-white rounded-2xl border border-slate-200 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] flex flex-col h-[560px] max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white p-3.5 flex items-center justify-between border-b border-plum-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-plum-700 to-plum-800 border border-plum-600 flex items-center justify-center text-peach-300 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>SilarAI Live Assistant</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[9px] font-bold rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Online
                  </span>
                </div>
                <div className="text-[11px] text-plum-200 flex items-center gap-1">
                  <span>Ecommerce Stores & Shopping Copilot</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-plum-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/90 px-3 py-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-plum-950 shadow-xs font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-plum-700" />
              <span>Live Q&A Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('lead')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'lead'
                  ? 'bg-white text-plum-950 shadow-xs font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-peach-600" />
              <span>Request Callback / Quote</span>
            </button>
          </div>

          {/* Main Body Area */}
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/40">
              
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-plum-800 to-plum-700 text-white rounded-br-xs font-medium shadow-sm'
                          : m.sender === 'system'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl w-full shadow-xs'
                          : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.text}</div>

                      {/* Lead Submitted Confirmation Card inside chat */}
                      {m.leadSubmitted && (
                        <div className="mt-3 pt-3 border-t border-emerald-200/80 space-y-2 text-[11px]">
                          <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-300/80 space-y-1">
                            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Drafted to: {m.leadSubmitted.targetEmail} — press Send in your mail app
                            </div>
                            <div className="text-slate-600">
                              From: <span className="font-semibold text-slate-800">{m.leadSubmitted.name}</span> ({m.leadSubmitted.phone})
                            </div>
                            <div className="text-[10px] text-slate-400">Timestamp: {m.leadSubmitted.timestamp}</div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={generateMailtoUrl(m.leadSubmitted)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors text-[11px]"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Re-open in mail app</span>
                            </a>
                            <button
                              onClick={() => copyToClipboard(`Lead Details: Name: ${m.leadSubmitted?.name}, Email: ${m.leadSubmitted?.email}, Phone: ${m.leadSubmitted?.phone}. Target: ${targetEmail}`, 'lead')}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                              title="Copy details"
                            >
                              {copiedLead ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Interactive Lead Trigger Card */}
                      {m.showLeadForm && !m.leadSubmitted && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <button
                            onClick={() => setActiveTab('lead')}
                            className="w-full py-2 px-3 bg-gradient-to-r from-peach-500 to-peach-600 hover:from-peach-600 hover:to-peach-700 text-white font-bold rounded-xl flex items-center justify-between text-[11px] shadow-xs transition-all"
                          >
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              Leave your Name, Email & Phone for Callback
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Suggested Follow-up Questions */}
                      {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Questions:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {m.suggestedQuestions.map((sq, sqIdx) => (
                              <button
                                key={sqIdx}
                                onClick={() => handleSendMessage(sq)}
                                className="text-[11px] text-left bg-slate-100 hover:bg-peach-50 hover:text-plum-950 font-medium text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors"
                              >
                                {sq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-400 px-1 mt-1">{m.timestamp}</span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
                    <div className="w-6 h-6 rounded-lg bg-plum-100 text-plum-800 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-plum-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-plum-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-plum-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[11px] text-slate-400 ml-1">SilarAI Assistant is analyzing...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200/80">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputVal);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Ask about building a store or AI shopping assistant..."
                    className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-plum-700 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isLoading}
                    className="bg-plum-800 hover:bg-plum-900 disabled:opacity-50 text-peach-300 p-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-peach-500" />
                    Sub-100ms vector answers
                  </span>
                  <button
                    onClick={() => setActiveTab('lead')}
                    className="text-plum-700 hover:underline font-semibold"
                  >
                    Email our team
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Lead Capture Tab: collects Name, Email, Phone and hands off to the visitor's mail client (mailto:) */
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-plum-950 to-plum-900 text-white p-3.5 rounded-xl border border-plum-800">
                  <div className="flex items-center gap-2 text-peach-300 text-xs font-bold mb-1">
                    <Building className="w-4 h-4" />
                    <span>Inquire with SilarAI Engineering</span>
                  </div>
                  <p className="text-[11px] text-plum-100 leading-relaxed">
                    Leave your details below and we'll open a pre-filled email to{' '}
                    <span className="font-bold text-white underline decoration-peach-400">{targetEmail}</span> in your mail app. Press Send there to reach our team.
                  </p>
                </div>

                {leadErrorMessage && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                    <span className="font-bold">⚠️</span>
                    <span>{leadErrorMessage}</span>
                  </div>
                )}

                {leadStatus === 'success' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Enquiry drafted in your mail app — press Send to deliver it
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Nothing has been sent yet. If your mail app didn't open, email {targetEmail} directly — the address is below.
                    </p>
                    <a
                      href={generateMailtoUrl()}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 py-1.5 px-3 rounded-lg transition-colors mt-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Re-open in mail app
                    </a>
                  </div>
                )}

                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Michael Chen"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-plum-700"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="e.g. michael@company.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-plum-700"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="e.g. (+91) 9444139089 or +1 555-0199"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-plum-700"
                    />
                  </div>

                  {/* Inquiry / Requirements */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Store className="w-3 h-3 text-slate-400" />
                      Store & Assistant Requirements (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={leadInquiry}
                      onChange={(e) => setLeadInquiry(e.target.value)}
                      placeholder="e.g. Looking to build an ecommerce store with 30,000 SKUs and deploy the AI Shopping Assistant with SAP sync."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-plum-700 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={leadStatus === 'submitting'}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-plum-800 to-plum-900 hover:from-plum-700 hover:to-plum-800 text-peach-300 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {leadStatus === 'submitting' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Opening your mail app...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Draft email to our team</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Direct Contact Alternatives */}
                <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-600 space-y-2">
                  <div className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Direct Enterprise Contact:</span>
                    <span className="text-[10px] text-emerald-600 font-bold">15-min SLA</span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-plum-700 shrink-0" />
                      <span className="font-mono text-slate-800 truncate">{targetEmail}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(targetEmail, 'email')}
                        className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors"
                        title="Copy Email"
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={`mailto:${targetEmail}?subject=SilarAI%20Enterprise%20Inquiry`}
                        className="p-1 text-plum-700 hover:text-plum-900 rounded"
                        title="Send Mail"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-peach-600 shrink-0" />
                      <span className="font-mono text-slate-800">(+91) 9444139089</span>
                    </div>
                    <a
                      href="tel:+919444139089"
                      className="text-[10px] font-bold text-peach-700 hover:underline flex items-center gap-1"
                    >
                      Call Sales <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveTab('chat')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1"
                >
                  ← Back to Interactive Chat
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
