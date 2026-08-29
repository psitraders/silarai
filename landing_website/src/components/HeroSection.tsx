import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import heroBgImage from '../assets/images/hero_commerce_bg_1785402667460.jpg';
import {
  Bot,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  Send,
  CheckCircle2,
  BarChart3,
  Search,
  Filter,
  Zap,
  ShieldCheck,
  ChevronRight,
  LogIn,
  Cpu,
  Radio,
  Activity,
  MessageSquare,
  Globe,
  Share2,
  Sliders,
  Play,
} from 'lucide-react';

interface HeroSectionProps {
  onBookDemo: () => void;
  onWatchTour?: () => void;
  onLogin?: () => void;
}

const ROTATING_TEXTS = [
  'Sell 3x More',
  'Automate Marketing',
  'Scale Conversions',
  'Delight Shoppers',
];

const QUICK_PROMPTS = [
  { label: '🔩 Hydraulic Valves', query: 'I need a heavy-duty hydraulic valve rated for 2,500 PSI steel piping with 2-inch flange.' },
  { label: '📱 WhatsApp Order Sync', query: 'Can you show me how WhatsApp AI bot recovers abandoned carts?' },
  { label: '⚡ Dynamic Upsell', query: 'What cross-sell recommendations work best for B2B industrial buyers?' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookDemo, onWatchTour, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'catalog'>('chat');
  const [rotatingIndex, setRotatingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const handleLoginClick = () => {
    if (onLogin) {
      onLogin();
    } else {
      window.location.href = 'https://app.silarai.com/login';
    }
  };

  const [userQuery, setUserQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; products?: any[]; time?: string }>
  >([
    {
      sender: 'user',
      text: 'I need a heavy-duty hydraulic valve rated for 2,500 PSI steel piping with 2-inch flange.',
      time: '10:24 AM',
    },
    {
      sender: 'assistant',
      text: 'I found 2 exact hydraulic valves matching 2,500 PSI for 2" steel piping. Both are in stock with ready dispatch.',
      products: [
        {
          name: 'H-2500 Heavy-Duty Flanged Valve',
          sku: 'APX-2500-2FL',
          price: '$420.00',
          stock: '18 in stock',
          rating: '4.9/5',
          image: '🔩',
        },
        {
          name: 'ProSpec Stainless Valve Tier-2',
          sku: 'SS-2500-FL2',
          price: '$580.00',
          stock: '6 in stock',
          rating: '5.0/5',
          image: '⚙️',
        },
      ],
      time: '10:24 AM',
    },
  ]);

  const sendQueryText = (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    const newMsg = { sender: 'user' as const, text: queryText, time: 'Just now' };
    setChatMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Based on "${queryText}", SilarAI cross-referenced your catalog spec sheets and verified 100% compatibility. Would you like to add to cart or request B2B Net-30 quote?`,
          products: [
            {
              name: 'Recommended Industrial Spec Item',
              sku: 'SILAR-PRO-99',
              price: '$340.00',
              stock: 'Ready to ship',
              rating: '4.9/5',
              image: '⚡',
            },
          ],
          time: 'Just now',
        },
      ]);
    }, 900);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    sendQueryText(userQuery);
    setUserQuery('');
  };

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-plum-950 text-white overflow-hidden">
      {/* Background Hero Image with Glowing Gradient Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroBgImage}
          alt="Future of AI E-Commerce Integration"
          className="w-full h-full object-cover object-top opacity-30 filter brightness-105 contrast-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-plum-950/90 via-plum-950/80 to-plum-950/98" />
        
        {/* Animated Radial Ambient Lights */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-gradient-to-tr from-teal-400/20 via-plum-600/30 to-peach-300/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-coral-400/15 rounded-full blur-3xl pointer-events-none"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Floating Animated Robotic HUD Chips */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden xl:flex absolute left-2 top-20 items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-plum-900/90 border border-teal-300/50 text-xs font-mono text-teal-200 shadow-2xl backdrop-blur-md z-20 pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            <Cpu className="w-5 h-5 text-peach-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          </div>
          <div>
            <div className="font-bold text-white text-[11px] leading-tight flex items-center gap-1">
              <span>ROBOTIC AI CORE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[9px] text-teal-300 font-mono flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-peach-300" />
              <span>50ms Vector Scan</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -1.5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="hidden xl:flex absolute right-2 top-28 items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-plum-900/90 border border-coral-400/50 text-xs font-mono text-coral-200 shadow-2xl backdrop-blur-md z-20 pointer-events-none"
        >
          <div className="w-8 h-8 rounded-xl bg-plum-800 border border-coral-400/60 flex items-center justify-center text-peach-300 relative overflow-hidden">
            <Bot className="w-4 h-4 animate-bounce" />
            <motion.div
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-teal-400/20"
            />
          </div>
          <div>
            <div className="font-bold text-white text-[11px] leading-tight">AUTONOMOUS AGENT</div>
            <div className="text-[9px] text-peach-300">24/7 Live Commerce Bot</div>
          </div>
        </motion.div>

        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-plum-900/95 border border-teal-300/60 text-teal-200 text-xs sm:text-sm font-bold shadow-lg backdrop-blur-md hover:border-peach-300 transition-colors">
            <span className="flex h-2.5 w-2.5 rounded-full bg-coral-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-peach-300" />
            <span>Next-Gen AI Commerce &amp; Marketing Engine</span>
            <ChevronRight className="w-3.5 h-3.5 text-coral-400" />
          </div>
        </motion.div>

        {/* Main Hero Headline with Rotating Animated Accent */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center max-w-4xl mx-auto space-y-5"
        >
          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.14]">
            One AI Platform to{' '}
            <span className="inline-block relative text-teal-300 min-w-[220px] sm:min-w-[310px] text-left">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotatingIndex}
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="inline-block underline decoration-coral-400 decoration-wavy decoration-2 text-peach-200 font-extrabold"
                >
                  {ROTATING_TEXTS[rotatingIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p id="hero-description" className="text-base sm:text-xl text-plum-100 font-medium leading-relaxed max-w-3xl mx-auto">
            Launch a modern AI storefront, help buyers discover exact products in seconds, and automate marketing across Instagram, Facebook &amp; WhatsApp from a single unified workspace.
          </p>

          {/* Animated Interactive Feature Chips instead of long text blocks */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { icon: Bot, label: 'Conversational Shopping' },
              { icon: Sparkles, label: 'AI Marketing Campaigns' },
              { icon: MessageSquare, label: 'WhatsApp & Social Automation' },
              { icon: Zap, label: '1-Click Catalog Sync' },
            ].map((chip, idx) => {
              const ChipIcon = chip.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.04, y: -2 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-plum-900/80 border border-plum-700 text-xs font-semibold text-plum-100 shadow-sm backdrop-blur-xs hover:border-teal-300 transition-all cursor-default"
                >
                  <ChipIcon className="w-3.5 h-3.5 text-peach-300" />
                  <span>{chip.label}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3">
            <button
              onClick={onBookDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-black text-plum-950 bg-coral-400 hover:bg-coral-500 active:bg-coral-600 rounded-xl shadow-xl shadow-coral-500/20 hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:scale-98 cursor-pointer group"
            >
              <span>Book Live Demo</span>
              <ArrowRight className="w-5 h-5 text-plum-950 group-hover:translate-x-1 transition-transform" />
            </button>

            {onWatchTour && (
              <button
                onClick={onWatchTour}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-plum-100 bg-plum-900/80 hover:bg-plum-800 border border-plum-700/80 hover:border-peach-300 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-peach-300 fill-peach-300" />
                <span>Watch Product Tour</span>
              </button>
            )}

            <button
              onClick={handleLoginClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base font-bold text-white bg-plum-900/80 hover:bg-plum-800 active:bg-plum-950 border border-teal-300/40 rounded-xl shadow-sm hover:shadow-md transition-all backdrop-blur-md cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-300">
                <LogIn className="w-4 h-4" />
              </div>
              Login
            </button>
          </div>

          {/* Social Proof Trust Snippet */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs text-plum-200 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-300" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-300" />
              1-Click E-Commerce &amp; Platform Sync
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-300" />
              Launch in under 3 days
            </span>
          </div>
        </motion.div>

        {/* Hero Interactive Dashboard Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 sm:mt-14 max-w-5xl mx-auto"
        >
          <div className="relative rounded-[2rem] bg-white p-2.5 sm:p-4 border border-slate-200/90 shadow-2xl shadow-plum-900/20 overflow-hidden">
            
            {/* Holographic Radar Scanning Line */}
            <motion.div
              animate={{ y: ['0%', '100%', '0%'] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent z-30 pointer-events-none opacity-70 shadow-[0_0_12px_#2dd4bf]"
            />

            {/* Top SaaS Window Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-plum-950 text-white rounded-2xl mb-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-plum-200 bg-plum-900 px-3 py-1 rounded-lg border border-plum-800">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Bot className="w-3.5 h-3.5 text-peach-300" />
                  </motion.div>
                  <span>app.silarai.com/commerce/copilot</span>
                </div>
              </div>

              {/* Tab Selector Buttons */}
              <div className="flex items-center gap-1 bg-plum-900 p-1 rounded-xl text-xs font-semibold text-plum-200">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'chat' ? 'bg-plum-700 text-peach-300 font-bold shadow-xs' : 'hover:text-white hover:bg-plum-800'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-peach-300" />
                  AI Copilot
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'analytics' ? 'bg-plum-700 text-peach-300 font-bold shadow-xs' : 'hover:text-white hover:bg-plum-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-peach-300" />
                  Revenue Analytics
                </button>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'catalog' ? 'bg-plum-700 text-peach-300 font-bold shadow-xs' : 'hover:text-white hover:bg-plum-800'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-peach-300" />
                  Catalog Intelligence
                </button>
              </div>
            </div>

            {/* Quick Interactive Prompt Chips Bar */}
            {activeTab === 'chat' && (
              <div className="mb-3 px-1 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-plum-700" /> Try Prompts:
                </span>
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQueryText(qp.query)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-plum-50 hover:bg-plum-100 text-plum-900 border border-plum-200 text-[11px] font-semibold transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            )}

            {/* Tab 1: AI Shopping Assistant Interactive Demo */}
            <AnimatePresence mode="wait">
              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50/80 p-3 sm:p-4 rounded-2xl border border-slate-200/80"
                >
                  {/* Left Column: Live AI Chat Interface */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between h-[420px] shadow-2xs">
                    {/* Chat Top Status */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <motion.div
                            animate={{ scale: [1, 1.06, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-9 h-9 rounded-xl bg-plum-700 flex items-center justify-center text-peach-300 shadow-xs"
                          >
                            <Bot className="w-5 h-5" />
                          </motion.div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            SilarAI Assistant <Zap className="w-3.5 h-3.5 text-peach-600 fill-peach-500" />
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                            Connected to 40,000 Catalog Items &amp; Spec Sheets
                          </div>
                        </div>
                      </div>
                      <span className="bg-peach-100 text-plum-900 border border-peach-300/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Activity className="w-3 h-3 text-plum-700 animate-pulse" />
                        Live Test Mode
                      </span>
                    </div>

                    {/* Message Stream */}
                    <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                      {chatMessages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              msg.sender === 'user'
                                ? 'bg-plum-700 text-white rounded-br-none shadow-2xs'
                                : 'bg-plum-50 text-slate-900 rounded-bl-none border border-plum-100/80'
                            }`}
                          >
                            <p>{msg.text}</p>
                            {msg.products && (
                              <div className="mt-2.5 space-y-2">
                                {msg.products.map((p, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-900 flex items-center justify-between gap-2 shadow-2xs hover:border-plum-300 transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-xl">{p.image}</span>
                                      <div>
                                        <div className="font-bold text-xs text-slate-900">{p.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">SKU: {p.sku} | {p.stock}</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs font-extrabold text-plum-700">{p.price}</div>
                                      <button
                                        onClick={() => alert(`Added ${p.name} to demo order!`)}
                                        className="mt-1 text-[10px] font-bold text-white bg-plum-700 hover:bg-plum-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                      >
                                        Add to Cart
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                        </motion.div>
                      ))}

                      {isTyping && (
                        <div className="flex items-center gap-2 text-xs text-plum-700 font-semibold bg-plum-50 px-3 py-2 rounded-xl w-fit border border-plum-100">
                          <Bot className="w-4 h-4 animate-spin text-peach-600" />
                          <span>AI is checking catalog specs...</span>
                        </div>
                      )}
                    </div>

                    {/* Input form */}
                    <form onSubmit={handleSendMessage} className="relative pt-2 border-t border-slate-100">
                      <input
                        type="text"
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        placeholder="Ask any technical, pricing, or compatibility question..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-plum-500 focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-3.5 text-plum-950 bg-peach-300 hover:bg-peach-400 p-1.5 rounded-lg transition-colors font-bold cursor-pointer"
                        aria-label="Send query"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Live Stats & Recommendations Preview */}
                  <div className="lg:col-span-5 space-y-3">
                    {/* Revenue Growth Card with Animated Bars */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Live Conversion Uplift</span>
                        <span className="text-xs font-bold text-plum-900 bg-peach-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-plum-700" /> +45.2%
                        </span>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900 mt-1">$148,290.00</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">AI-guided order volume this month</div>

                      {/* Animated Mini SVG Graph Bars */}
                      <div className="mt-3 h-16 w-full flex items-end gap-1.5 pt-2">
                        {[35, 42, 58, 65, 80, 75, 95, 110, 125, 148].map((val, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ height: 0 }}
                            animate={{ height: `${(val / 150) * 100}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.05 }}
                            className={`flex-1 rounded-t-sm transition-all duration-300 ${
                              idx === 9 ? 'bg-plum-700 shadow-xs' : 'bg-plum-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* AI Product Recommendations Mini Card */}
                    <div className="bg-gradient-to-br from-plum-800 via-plum-900 to-plum-950 text-white p-4 rounded-2xl shadow-md border border-plum-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-peach-300 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-peach-300" /> Intent AI Engine
                        </div>
                        <span className="text-[10px] bg-white/10 text-peach-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          Real-time
                        </span>
                      </div>
                      <div className="mt-2 text-xs sm:text-sm font-semibold text-slate-100">
                        "Customers asking about 2,500 PSI valves buy Gaskets 84% of time."
                      </div>
                      <div className="mt-3 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl flex items-center justify-between border border-white/10">
                        <div className="text-xs">
                          <div className="font-bold text-white">Suggested Cross-Sell Gasket Kit</div>
                          <div className="text-[10px] text-peach-200">Auto-offered in checkout</div>
                        </div>
                        <span className="text-xs font-extrabold bg-peach-300 text-plum-950 px-2.5 py-1 rounded-lg shadow-2xs">
                          +$48.00 AOV
                        </span>
                      </div>
                    </div>

                    {/* Quick Feature Badges */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5 bg-plum-50/60 p-2 rounded-xl text-plum-900 border border-plum-100">
                        <ShieldCheck className="w-4 h-4 text-plum-700" />
                        <span>Live Price Sync</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-plum-50/60 p-2 rounded-xl text-plum-900 border border-plum-100">
                        <Bot className="w-4 h-4 text-plum-700" />
                        <span>WhatsApp Bot</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Revenue Analytics View */}
              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500">Total Commerce Revenue</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">$482,900</div>
                      <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> +38.4% vs last quarter
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500">AI Assistant Interactions</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">28,410</div>
                      <div className="text-xs font-bold text-plum-700 mt-1 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-peach-600" /> 94.8% resolution accuracy
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500">Avg. Order Value (AOV)</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">$1,240</div>
                      <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-peach-600" /> +$280 from AI recommendations
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900">Conversion Comparison (Traditional Search vs SilarAI AI)</h3>
                      <span className="text-xs text-slate-500 font-medium">Last 30 Days</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>SilarAI Conversational Shoppers</span>
                          <span className="text-plum-700 font-extrabold">6.42% Conversion Rate</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 0.8 }}
                            className="bg-plum-700 h-3 rounded-full"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                          <span>Traditional Keyword Search Visitors</span>
                          <span>1.84% Conversion Rate</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '32%' }}
                            transition={{ duration: 0.8 }}
                            className="bg-slate-300 h-3 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Catalog Intelligence */}
              {activeTab === 'catalog' && (
                <motion.div
                  key="catalog"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        readOnly
                        value="42,100 SKUs indexed with vector spec embeddings"
                        className="text-xs font-mono text-slate-700 bg-transparent outline-none w-80"
                      />
                    </div>
                    <button className="text-xs font-bold text-plum-800 bg-peach-100 px-3 py-1 rounded-lg flex items-center gap-1 border border-peach-200 cursor-pointer">
                      <Filter className="w-3 h-3" /> Filter by Product Group
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: 'Flanged Pressure Valve 2"', sku: 'APX-VALVE-200', spec: '2500 PSI Steel', aiScore: '99% Index Match', price: '$420' },
                      { name: 'Industrial Motor Controller', sku: 'MOT-CTRL-440V', spec: '440V Three Phase', aiScore: '98% Index Match', price: '$1,290' },
                      { name: 'Hydraulic Seal Gasket Set', sku: 'GSK-HYD-SET', spec: 'EPDM High Temp', aiScore: '100% Index Match', price: '$48' },
                      { name: 'Titanium Flow Meter B2B', sku: 'FLM-TITAN-9', spec: 'NPT 1.5 Inch Digital', aiScore: '97% Index Match', price: '$850' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between hover:shadow-sm transition-shadow">
                        <div>
                          <div className="font-bold text-xs text-slate-900">{item.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku} | {item.spec}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-slate-900">{item.price}</div>
                          <span className="text-[10px] font-bold text-plum-900 bg-peach-200 px-2 py-0.5 rounded-md">
                            {item.aiScore}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

