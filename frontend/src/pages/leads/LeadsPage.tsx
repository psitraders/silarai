import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Inbox } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge, getLeadStatusBadge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { leadsApi } from '../../api/leads.api';
import type { LeadStatus } from '../../types/lead.types';
import { formatDate } from '../../utils/formatDate';

const statusLabels: Record<LeadStatus, string> = {
  NewInquiry: 'New Inquiry',
  PriceShared: 'Price Shared',
  Interested: 'Interested',
  FollowUpPending: 'Follow-up',
  OrderConfirmed: 'Order Confirmed',
  Lost: 'Lost',
  RepeatOpportunity: 'Repeat',
};

const channelColors: Record<string, string> = {
  WhatsApp: 'text-green-700 bg-green-50',
  Instagram: 'text-pink-700 bg-pink-50',
  Facebook: 'text-blue-700 bg-blue-50',
  Direct: 'text-slate-700 bg-slate-100',
};

export function LeadsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['leads', search, statusFilter],
    queryFn: () => leadsApi.getLeads({ search: search || undefined, status: statusFilter }),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inbox</h1>
          <p className="text-slate-500 text-sm mt-0.5">All your messages and leads in one place.</p>
        </div>
        <Button onClick={() => navigate('/leads/new')}>
          <Plus className="w-4 h-4" /> Add Lead
        </Button>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setStatusFilter(undefined)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${!statusFilter ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              All ({data?.totalCount ?? 0})
            </button>
            {Object.entries(statusLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key as LeadStatus)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="bg-transparent text-sm outline-none w-40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!data?.items?.length ? (
          <EmptyState
            icon={<Inbox className="w-8 h-8" />}
            title="No leads yet"
            description="Share your store link on WhatsApp, Instagram, or Facebook to start getting inquiries."
            action={{ label: '+ Add Lead Manually', onClick: () => navigate('/leads/new') }}
          />
        ) : (
          <div>
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] text-xs text-slate-500 font-medium px-6 py-3 border-b border-slate-50">
              <span>Customer</span>
              <span>Channel</span>
              <span>Product</span>
              <span>Time</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {data.items.map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center px-6 py-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-sm font-bold text-teal-700 shrink-0">
                    {lead.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{lead.customerName}</p>
                    {lead.customerPhone && <p className="text-xs text-slate-400">{lead.customerPhone}</p>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg hidden md:inline-flex w-fit ${channelColors[lead.sourceChannel] ?? 'bg-slate-100 text-slate-600'}`}>
                  {lead.sourceChannel}
                </span>
                <span className="text-sm text-slate-600 hidden md:block truncate">
                  {lead.interestedProductTitle ?? '—'}
                </span>
                <span className="text-xs text-slate-400 hidden md:block">
                  {formatDate(lead.createdAt)}
                </span>
                <Badge variant={getLeadStatusBadge(lead.status)}>
                  {statusLabels[lead.status]}
                </Badge>
                <button
                  className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center text-white hover:bg-teal-800 transition-colors shrink-0"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
