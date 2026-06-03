import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, MessageCircle, Mail, Send, ChevronRight,
  CheckCircle, Clock, AlertCircle, Loader2, Users, BarChart2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { marketingApi } from '../../api/marketing.api';
import { formatDistanceToNow } from 'date-fns';

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  Draft:     { label: 'Draft',      color: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400'  },
  Scheduled: { label: 'Scheduled',  color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'   },
  Sending:   { label: 'Sending…',   color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500'  },
  Sent:      { label: 'Sent',       color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
  Failed:    { label: 'Failed',     color: 'bg-red-100 text-red-700',       dot: 'bg-red-500'    },
};

export function CampaignListPage() {
  const navigate = useNavigate();
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => marketingApi.getCampaigns(),
  });

  const sentCount   = campaigns.filter((c: any) => c.status === 'Sent').length;
  const totalReach  = campaigns.filter((c: any) => c.status === 'Sent').reduce((s: number, c: any) => s + c.sentCount, 0);
  const draftCount  = campaigns.filter((c: any) => c.status === 'Draft').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Campaigns</h1>
          <p className="text-slate-400 text-sm mt-0.5">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button onClick={() => navigate('/marketing/campaigns/new')}>
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      {/* Stats */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Send,      label: 'Campaigns Sent',  value: sentCount,  gradient: 'from-teal-600 to-teal-500'   },
            { icon: Users,     label: 'People Reached',  value: totalReach, gradient: 'from-blue-600 to-blue-500'   },
            { icon: Clock,     label: 'Drafts',          value: draftCount, gradient: 'from-slate-600 to-slate-500' },
          ].map(s => (
            <div key={s.label} className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${s.gradient} shadow-sm`}>
              <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-white/10" />
              <s.icon className="w-4 h-4 text-white/70 mb-2" />
              <p className="text-2xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-white/70 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-slate-200" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No campaigns yet</h3>
          <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto">
            Create your first WhatsApp or Email campaign to reach customers and drive more sales.
          </p>
          <Button onClick={() => navigate('/marketing/campaigns/new')}>
            <Plus className="w-4 h-4" /> Create Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c: any) => {
            const st = statusConfig[c.status] ?? statusConfig.Draft;
            const isWA = c.type === 'WhatsApp';
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/marketing/campaigns/${c.id}`)}
                className="bg-white border border-slate-100 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${isWA ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                    {isWA
                      ? <MessageCircle className="w-6 h-6 text-white" />
                      : <Mail className="w-6 h-6 text-white" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-slate-900 truncate">{c.title}</h3>
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold ${st.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${c.status === 'Sending' ? 'animate-pulse' : ''}`} />
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {c.type} · {c.recipientCount} recipients
                      {c.sentAt ? ` · Sent ${formatDistanceToNow(new Date(c.sentAt))} ago` : ''}
                    </p>
                  </div>

                  {/* Stats (if sent) */}
                  {c.status === 'Sent' && (
                    <div className="hidden sm:flex items-center gap-4 mr-2">
                      <div className="text-center">
                        <p className="text-lg font-extrabold text-slate-900">{c.sentCount}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Sent</p>
                      </div>
                    </div>
                  )}

                  {/* Arrow */}
                  <div className="flex items-center">
                    {c.status === 'Sending'
                      ? <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                      : c.status === 'Failed'
                      ? <AlertCircle className="w-4 h-4 text-red-400" />
                      : c.status === 'Sent'
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      {campaigns.length > 0 && (
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-lg shadow-teal-100">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-white flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Keep the momentum going</p>
              <p className="text-xs text-teal-100">Sellers who send weekly campaigns get 3× more repeat orders.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/marketing/campaigns/new')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-teal-700 rounded-xl text-sm font-bold hover:bg-teal-50 transition whitespace-nowrap shadow"
          >
            New Campaign <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
