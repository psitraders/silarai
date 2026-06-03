import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageCircle, Mail, Sparkles, BarChart2, Bell, Users,
  Send, ChevronRight, Clock, CheckCircle, Zap, Target,
  TrendingUp, Flame, Gift, Calendar, Bot, FileText, Video, QrCode,
} from 'lucide-react';
import { marketingApi } from '../../api/marketing.api';

const features = [
  {
    icon: MessageCircle,
    gradient: 'from-green-500 to-emerald-600',
    lightBg: 'bg-green-50',
    iconColor: 'text-green-600',
    badge: '🚀 Most Used',
    badgeColor: 'bg-green-100 text-green-700',
    title: 'WhatsApp Campaigns',
    desc: 'Send bulk messages to customers on WhatsApp. Pick recipients, write your message, and launch in minutes.',
    path: '/marketing/campaigns/new?type=whatsapp',
    cta: 'Create WA Campaign',
  },
  {
    icon: Bot,
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    badge: '✨ AI-Powered',
    badgeColor: 'bg-violet-100 text-violet-700',
    title: 'AI Reply Generator',
    desc: 'Generate perfect WhatsApp replies in seconds using AI trained on your catalog, tone, and customer history.',
    path: '/ai/replies',
    cta: 'Generate Reply',
  },
  {
    icon: Sparkles,
    gradient: 'from-indigo-500 to-blue-600',
    lightBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    badge: '📸 Go Viral',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    title: 'AI Social Content + Poster',
    desc: 'Generate captions, hashtags, CTAs — and an AI poster image — for Instagram, Facebook, and WhatsApp.',
    path: '/ai/social-post',
    cta: 'Generate Content',
  },
  {
    icon: FileText,
    gradient: 'from-teal-500 to-cyan-600',
    lightBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    badge: '📝 Multi-Language',
    badgeColor: 'bg-teal-100 text-teal-700',
    title: 'AI Product Description',
    desc: 'Generate WhatsApp & Instagram product descriptions in English, Hindi, Gujarati, Marathi and more.',
    path: '/ai/product-description',
    cta: 'Generate Description',
  },
  {
    icon: Video,
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    badge: '🎬 New',
    badgeColor: 'bg-rose-100 text-rose-700',
    title: 'Reel / Short Video Script',
    desc: 'Get a ready-to-film 15s, 30s, or 60s Instagram Reel script for any product in seconds.',
    path: '/ai/reel-script',
    cta: 'Write My Script',
  },
  {
    icon: Calendar,
    gradient: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badge: '🗓️ Auto Dates',
    badgeColor: 'bg-amber-100 text-amber-700',
    title: 'Festival Calendar',
    desc: 'See all upcoming festivals and holidays with one-click campaign and AI social post launchers.',
    path: '/marketing/festival-calendar',
    cta: 'View Calendar',
  },
  {
    icon: Mail,
    gradient: 'from-blue-500 to-cyan-600',
    lightBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badge: null,
    badgeColor: '',
    title: 'Email Campaigns',
    desc: 'Send newsletters and follow-up sequences to nurture leads and bring back past customers via email.',
    path: '/marketing/campaigns/new?type=email',
    cta: 'Create Email Campaign',
  },
  {
    icon: Bell,
    gradient: 'from-slate-600 to-slate-700',
    lightBg: 'bg-slate-50',
    iconColor: 'text-slate-600',
    badge: '⚡ Auto',
    badgeColor: 'bg-slate-100 text-slate-700',
    title: 'Follow-up Reminders',
    desc: "Never let a lead go cold. Smart reminders for leads with no response — reach out at the right moment.",
    path: '/marketing/reminders',
    cta: 'View Reminders',
  },
  {
    icon: Target,
    gradient: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    badge: '🛒 Recover Revenue',
    badgeColor: 'bg-purple-100 text-purple-700',
    title: 'Abandoned Cart Recovery',
    desc: 'Automatically identify and follow up on customers who added to cart but never completed their order.',
    path: '/marketing/abandoned-carts',
    cta: 'Recover Carts',
  },
  {
    icon: QrCode,
    gradient: 'from-slate-700 to-slate-900',
    lightBg: 'bg-slate-50',
    iconColor: 'text-slate-700',
    badge: null,
    badgeColor: '',
    title: 'QR Code Generator',
    desc: 'Generate QR codes for your store or products — print on packaging, posters, and visiting cards.',
    path: '/tools/qr-code',
    cta: 'Generate QR',
  },
];

const festivalTemplates = [
  { emoji: '🪔', name: 'Diwali Sale',    color: 'from-amber-400 to-orange-500' },
  { emoji: '🎄', name: 'Christmas',      color: 'from-green-500 to-emerald-600' },
  { emoji: '💝', name: "Valentine's",    color: 'from-rose-500 to-pink-600' },
  { emoji: '🌙', name: 'Eid Special',    color: 'from-violet-500 to-purple-600' },
  { emoji: '🎊', name: 'New Year',       color: 'from-blue-500 to-indigo-600' },
  { emoji: '👗', name: 'Fashion Week',   color: 'from-teal-500 to-cyan-600' },
];

export function MarketingHubPage() {
  const navigate = useNavigate();

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => marketingApi.getCampaigns(),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => marketingApi.getReminders(),
  });

  const sentCampaigns = campaigns.filter((c: any) => c.status === 'Sent');
  const totalReach = sentCampaigns.reduce((s: number, c: any) => s + c.sentCount, 0);
  const draftCampaigns = campaigns.filter((c: any) => c.status === 'Draft');

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Marketing Hub</h1>
          <p className="text-slate-400 text-sm mt-0.5">Grow your business — campaigns, AI content, and smart follow-ups.</p>
        </div>
        <button
          onClick={() => navigate('/marketing/campaigns')}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition shadow-sm shadow-teal-200"
        >
          <BarChart2 className="w-4 h-4" /> All Campaigns
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Campaigns Sent',     value: sentCampaigns.length, icon: Send,       gradient: 'from-teal-600 to-teal-500'    },
          { label: 'People Reached',     value: totalReach,            icon: Users,      gradient: 'from-blue-600 to-blue-500'    },
          { label: 'Drafts Waiting',     value: draftCampaigns.length, icon: Clock,      gradient: 'from-slate-600 to-slate-500'  },
          { label: 'Follow-ups Pending', value: reminders.length,      icon: Bell,       gradient: 'from-amber-500 to-orange-500' },
        ].map(s => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${s.gradient} shadow-sm`}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
            <s.icon className="w-5 h-5 text-white/70 mb-2" />
            <p className="text-2xl font-extrabold text-white">{s.value}</p>
            <p className="text-xs text-white/70 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Festival Templates ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900">Festival Campaign Templates</h2>
          </div>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Ready to use</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {festivalTemplates.map(t => (
            <button
              key={t.name}
              onClick={() => navigate(`/marketing/campaigns/new?template=${encodeURIComponent(t.name)}`)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 w-24 p-4 rounded-2xl bg-gradient-to-br ${t.color} text-white hover:scale-105 hover:shadow-lg transition-all duration-200`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-[11px] font-bold text-center leading-tight">{t.name}</span>
            </button>
          ))}
          <button
            onClick={() => navigate('/marketing/campaigns/new')}
            className="flex-shrink-0 flex flex-col items-center gap-2 w-24 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-teal-400 hover:text-teal-600 transition-all"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-[11px] font-bold text-center">Custom</span>
          </button>
        </div>
      </div>

      {/* ── AI Tip ── */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-violet-100">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Flame className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">💡 Pro Tip: Send campaigns between 7–9 PM</p>
          <p className="text-xs text-violet-200 mt-0.5">WhatsApp messages sent in the evening get 3× higher response rates from shoppers worldwide.</p>
        </div>
        <button
          onClick={() => navigate('/marketing/campaigns/new')}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-violet-700 rounded-xl text-xs font-bold hover:bg-violet-50 transition whitespace-nowrap shadow"
        >
          Launch Now <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Marketing Tools Grid ── */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Marketing Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div
              key={f.title}
              onClick={() => navigate(f.path)}
              className="group bg-white border border-slate-100 rounded-2xl p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`} />

              <div className="relative">
                {f.badge && (
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                )}
                <div className={`w-12 h-12 ${f.lightBg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-5">{f.desc}</p>
                <div className={`flex items-center gap-1 text-xs font-bold ${f.iconColor}`}>
                  {f.cta}
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Campaigns + Reminders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Recent Campaigns</h3>
            <button onClick={() => navigate('/marketing/campaigns')} className="text-xs text-teal-700 hover:underline font-semibold">View all →</button>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-slate-200" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No campaigns yet</p>
              <p className="text-xs text-slate-400 mt-1">Create your first campaign to reach customers.</p>
              <button
                onClick={() => navigate('/marketing/campaigns/new')}
                className="mt-3 text-xs font-bold text-teal-700 hover:underline"
              >
                Create your first campaign →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.slice(0, 5).map((c: any) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/marketing/campaigns/${c.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.type === 'WhatsApp' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {c.type === 'WhatsApp'
                      ? <MessageCircle className="w-4 h-4 text-green-700" />
                      : <Mail className="w-4 h-4 text-blue-700" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{c.title}</p>
                    <p className="text-xs text-slate-400">{c.recipientCount} recipients · {c.status}</p>
                  </div>
                  {c.status === 'Sent'
                    ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <Clock className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow-up Reminders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> Follow-up Reminders
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reminders.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {reminders.length} pending
            </span>
          </div>
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No leads need follow-up right now.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.slice(0, 5).map((r: any) => (
                <div key={r.leadId} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {r.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{r.customerName}</p>
                    <p className="text-xs text-slate-500">{r.status} · {r.daysSinceActivity}d no response</p>
                  </div>
                  {r.phone && (
                    <a
                      href={`https://wa.me/${r.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hi! Just following up on your inquiry. Can I help you today? 😊')}`}
                      target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="px-2.5 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition whitespace-nowrap"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Performance Banner ── */}
      <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center gap-4 shadow-lg shadow-teal-100">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-bold text-lg">Ready to grow your sales?</p>
          <p className="text-teal-100 text-sm mt-0.5">Sellers who send weekly campaigns get 3× more repeat orders. Start yours in 2 minutes.</p>
        </div>
        <button
          onClick={() => navigate('/marketing/campaigns/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 rounded-xl text-sm font-bold hover:bg-teal-50 transition shadow whitespace-nowrap"
        >
          Create Campaign <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
