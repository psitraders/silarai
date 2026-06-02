import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, MessageCircle, Mail, Send, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { marketingApi } from '../../api/marketing.api';
import { formatDistanceToNow } from 'date-fns';

const statusConfig: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600' },
  Scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  Sending: { label: 'Sending...', color: 'bg-amber-100 text-amber-700' },
  Sent: { label: 'Sent', color: 'bg-green-100 text-green-700' },
  Failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
};

export function CampaignListPage() {
  const navigate = useNavigate();
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => marketingApi.getCampaigns(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500 text-sm mt-0.5">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => navigate('/marketing/campaigns/new')}>
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <Send className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No campaigns yet</h3>
            <p className="text-sm text-slate-400 mb-4">Create your first WhatsApp or Email campaign to reach your customers.</p>
            <Button onClick={() => navigate('/marketing/campaigns/new')}>
              <Plus className="w-4 h-4" /> Create Campaign
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => {
            const st = statusConfig[c.status] ?? statusConfig.Draft;
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/marketing/campaigns/${c.id}`)}
                className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.type === 'WhatsApp' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {c.type === 'WhatsApp'
                      ? <MessageCircle className="w-6 h-6 text-green-700" />
                      : <Mail className="w-6 h-6 text-blue-700" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{c.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {c.type} · {c.recipientCount} recipients
                      {c.sentAt ? ` · Sent ${formatDistanceToNow(new Date(c.sentAt))} ago` : ''}
                    </p>
                  </div>
                  {c.status === 'Sent' && (
                    <div className="hidden sm:flex items-center gap-6 text-center mr-4">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{c.sentCount}</p>
                        <p className="text-xs text-slate-400">Sent</p>
                      </div>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
