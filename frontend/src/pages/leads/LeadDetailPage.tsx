import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Clock, StickyNote, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge, getLeadStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { PageLoader } from '../../components/ui/Spinner';
import { leadsApi } from '../../api/leads.api';
import { formatDate, formatDateFull } from '../../utils/formatDate';
import { generateWhatsAppLink } from '../../utils/whatsappLink';
import type { LeadStatus } from '../../types/lead.types';

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'NewInquiry', label: 'New Inquiry' },
  { value: 'PriceShared', label: 'Price Shared' },
  { value: 'Interested', label: 'Interested' },
  { value: 'FollowUpPending', label: 'Follow Up Pending' },
  { value: 'OrderConfirmed', label: 'Order Confirmed' },
  { value: 'Lost', label: 'Lost' },
  { value: 'RepeatOpportunity', label: 'Repeat Opportunity' },
];

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [noteText, setNoteText] = useState('');

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getLead(id!),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: LeadStatus) => leadsApi.updateStatus(id!, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lead', id] }),
  });

  const noteMutation = useMutation({
    mutationFn: (content: string) => leadsApi.addNote(id!, content),
    onSuccess: () => {
      setNoteText('');
      qc.invalidateQueries({ queryKey: ['lead', id] });
    },
  });

  if (isLoading) return <PageLoader />;
  if (!lead) return <div className="text-center py-12 text-slate-500">Lead not found.</div>;

  const channelColor: Record<string, string> = {
    WhatsApp: 'bg-green-100 text-green-800',
    Instagram: 'bg-purple-100 text-purple-800',
    Facebook: 'bg-blue-100 text-blue-800',
    Direct: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{lead.customerName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getLeadStatusBadge(lead.status)}>{lead.status}</Badge>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${channelColor[lead.sourceChannel] ?? 'bg-slate-100'}`}>
              {lead.sourceChannel}
            </span>
          </div>
        </div>
        {lead.customerPhone && (
          <a
            href={generateWhatsAppLink(lead.customerPhone, `Hi ${lead.customerName}!`)}
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {lead.inquiryNote && (
            <Card>
              <h2 className="font-semibold text-slate-900 mb-2">Inquiry</h2>
              <p className="text-sm text-slate-700">{lead.inquiryNote}</p>
            </Card>
          )}

          <Card>
            <h2 className="font-semibold text-slate-900 mb-4">
              <StickyNote className="w-4 h-4 inline mr-1.5" />
              Notes
            </h2>
            <div className="space-y-3 mb-4">
              {lead.notes.length === 0 && (
                <p className="text-sm text-slate-400">No notes yet.</p>
              )}
              {lead.notes.map(n => (
                <div key={n.id} className="bg-amber-50 rounded-xl p-3">
                  <p className="text-sm text-slate-800">{n.content}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add a note..."
                rows={2}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button
                size="sm"
                onClick={() => noteText.trim() && noteMutation.mutate(noteText.trim())}
                loading={noteMutation.isPending}
                disabled={!noteText.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900 mb-4">Activity</h2>
            <div className="space-y-3">
              {lead.activities.map(a => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">{a.description}</p>
                    <p className="text-xs text-slate-400">{formatDateFull(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-slate-900 mb-4">Contact Info</h2>
            <div className="space-y-2 text-sm">
              {lead.customerPhone && (
                <div><span className="text-slate-400">Phone</span><p className="font-medium">{lead.customerPhone}</p></div>
              )}
              {lead.customerEmail && (
                <div><span className="text-slate-400">Email</span><p className="font-medium">{lead.customerEmail}</p></div>
              )}
              <div><span className="text-slate-400">Created</span><p>{formatDateFull(lead.createdAt)}</p></div>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-900 mb-4">
              <Clock className="w-4 h-4 inline mr-1.5" />
              Update Status
            </h2>
            <Select
              options={STATUS_OPTIONS}
              value={lead.status}
              onChange={e => statusMutation.mutate(e.target.value as LeadStatus)}
            />
          </Card>

          {lead.followUpDate && (
            <Card>
              <h2 className="font-semibold text-slate-900 mb-2">Follow Up</h2>
              <p className="text-sm text-amber-700 font-medium">{formatDateFull(lead.followUpDate)}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
