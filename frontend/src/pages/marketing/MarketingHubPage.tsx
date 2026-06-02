import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageCircle, Mail, Sparkles, BarChart2, Bell, Users,
  Send, ChevronRight, Clock, CheckCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { marketingApi } from '../../api/marketing.api';

const features = [
  {
    icon: MessageCircle,
    color: 'bg-green-100',
    iconColor: 'text-green-700',
    title: 'WhatsApp Campaigns',
    desc: 'Send bulk messages to your customers via WhatsApp. Select recipients, write your message, and launch.',
    path: '/marketing/campaigns/new?type=whatsapp',
    cta: 'Create Campaign',
  },
  {
    icon: Mail,
    color: 'bg-blue-100',
    iconColor: 'text-blue-700',
    title: 'Email Follow-ups',
    desc: 'Send email newsletters and follow-up sequences to nurture leads and bring back past customers.',
    path: '/marketing/campaigns/new?type=email',
    cta: 'Create Email Campaign',
  },
  {
    icon: Sparkles,
    color: 'bg-violet-100',
    iconColor: 'text-violet-700',
    title: 'AI Social Post Generator',
    desc: 'Generate stunning captions and hashtags for Instagram, Facebook, and WhatsApp in seconds using AI.',
    path: '/ai/social-post',
    cta: 'Generate Post',
  },
  {
    icon: Bell,
    color: 'bg-amber-100',
    iconColor: 'text-amber-700',
    title: 'Follow-up Reminders',
    desc: 'Never let a lead go cold. Get reminders for inquiries with no response and repeat customer follow-ups.',
    path: '/marketing/reminders',
    cta: 'View Reminders',
  },
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

  const sentCampaigns = campaigns.filter(c => c.status === 'Sent');
  const totalReach = sentCampaigns.reduce((s, c) => s + c.sentCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketing</h1>
          <p className="text-slate-500 text-sm mt-0.5">Grow your business with campaigns, AI content, and smart follow-ups.</p>
        </div>
        <button
          onClick={() => navigate('/marketing/campaigns')}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors"
        >
          <BarChart2 className="w-4 h-4" /> All Campaigns
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Campaigns Sent', value: sentCampaigns.length, icon: Send, color: 'text-teal-700', bg: 'bg-teal-50' },
          { label: 'Total Recipients Reached', value: totalReach, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Follow-up Reminders', value: reminders.length, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Marketing Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => (
            <div
              key={f.title}
              onClick={() => navigate(f.path)}
              className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group"
            >
              <div className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mb-4`}>
                <f.icon className={`w-6 h-6 ${f.iconColor}`} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{f.desc}</p>
              <div className={`flex items-center gap-1 text-xs font-semibold ${f.iconColor}`}>
                {f.cta} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Campaigns</h3>
            <button onClick={() => navigate('/marketing/campaigns')} className="text-xs text-teal-700 hover:underline font-medium">View all</button>
          </div>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Send className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No campaigns yet</p>
              <button onClick={() => navigate('/marketing/campaigns/new')} className="mt-2 text-xs text-teal-700 font-medium hover:underline">Create your first campaign →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.slice(0, 5).map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/marketing/campaigns/${c.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.type === 'WhatsApp' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {c.type === 'WhatsApp' ? <MessageCircle className="w-4 h-4 text-green-700" /> : <Mail className="w-4 h-4 text-blue-700" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.title}</p>
                    <p className="text-xs text-slate-400">{c.recipientCount} recipients · {c.status}</p>
                  </div>
                  {c.status === 'Sent' && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                  {c.status === 'Draft' && <Clock className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Follow-up Reminders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Follow-up Reminders
            </h3>
            <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">{reminders.length} pending</span>
          </div>
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">All leads are up to date!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.slice(0, 6).map(r => (
                <div key={r.leadId} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-700">
                    {r.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{r.customerName}</p>
                    <p className="text-xs text-slate-500">{r.status} · {r.daysSinceActivity}d no response</p>
                  </div>
                  {r.phone && (
                    <a
                      href={`https://wa.me/${r.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hi! Just following up on your inquiry. Can I help you today? 😊')}`}
                      target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="px-2.5 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
