import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, MessageCircle, Mail, Send, Users,
  CheckCircle, ExternalLink, X, ChevronRight, ChevronLeft,
  PartyPopper,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { marketingApi } from '../../api/marketing.api';
import { formatDistanceToNow } from 'date-fns';

// ─── Step-through send modal ───────────────────────────────────────────────

interface SendTarget {
  name: string;
  phone: string;
  whatsAppUrl: string;
}

function SendModal({
  targets,
  onClose,
}: {
  targets: SendTarget[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  const current = targets[index];
  const total   = targets.length;
  const progress = ((opened.size) / total) * 100;

  const openWhatsApp = () => {
    window.open(current.whatsAppUrl, '_blank', 'noreferrer');
    setOpened(prev => new Set([...prev, index]));
  };

  const next = () => {
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
    }
  };

  const prev = () => setIndex(i => Math.max(0, i - 1));

  const skip = () => next();

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && !done) next();
      if (e.key === 'ArrowLeft' && !done) prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, done, opened]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">
              {done ? 'Campaign Complete! 🎉' : 'Send WhatsApp Messages'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {done
                ? `${opened.size} of ${total} messages sent`
                : `Contact ${index + 1} of ${total}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${done ? 100 : progress}%` }}
          />
        </div>

        {done ? (
          /* Completion screen */
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">All done!</h3>
            <p className="text-sm text-slate-500 mb-2">
              You sent messages to {opened.size} contact{opened.size !== 1 ? 's' : ''}.
            </p>
            {opened.size < total && (
              <p className="text-xs text-amber-600 mb-6">
                {total - opened.size} contact{total - opened.size !== 1 ? 's were' : ' was'} skipped.
              </p>
            )}
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        ) : (
          /* Step through contacts */
          <div className="px-6 py-5 space-y-5">
            {/* Contact card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg flex-shrink-0">
                {current.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{current.name}</p>
                <p className="text-sm text-slate-500">{current.phone}</p>
              </div>
              {opened.has(index) && (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>

            {/* WhatsApp open button */}
            <a
              href={current.whatsAppUrl}
              target="_blank"
              rel="noreferrer"
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold text-base transition-colors shadow-md shadow-green-200"
            >
              <ExternalLink className="w-5 h-5" />
              Open WhatsApp for {current.name}
            </a>

            {opened.has(index) && (
              <p className="text-center text-xs text-green-600 font-medium animate-pulse">
                ✓ WhatsApp opened — click Next when done
              </p>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                disabled={index === 0}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={skip}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={next}
                className={`flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  opened.has(index)
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {index + 1 === total ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-xs text-slate-400">
              {opened.size} sent · {total - opened.size - (opened.has(index) ? 0 : 1)} remaining · press → to advance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirm send dialog ───────────────────────────────────────────────────

function ConfirmSendDialog({
  recipientCount,
  onConfirm,
  onCancel,
  loading,
}: {
  recipientCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Send className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg mb-1">Send Campaign?</h3>
        <p className="text-sm text-slate-500 mb-6">
          This will prepare personalised WhatsApp messages for{' '}
          <span className="font-semibold text-slate-800">{recipientCount} contact{recipientCount !== 1 ? 's' : ''}</span>.
          You'll send each message manually from WhatsApp.
        </p>
        <div className="flex gap-3">
          <Button onClick={onConfirm} loading={loading} className="flex-1">
            Yes, Send Now
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [showConfirm, setShowConfirm] = useState(false);
  const [sendTargets, setSendTargets] = useState<SendTarget[] | null>(null);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => marketingApi.getCampaign(id!),
    enabled: !!id,
  });

  const sendMutation = useMutation({
    mutationFn: () => marketingApi.sendCampaign(id!),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['campaign', id] });
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      setShowConfirm(false);
      if (data?.whatsAppTargets?.length > 0) {
        setSendTargets(data.whatsAppTargets);
      }
    },
  });

  if (isLoading) return <PageLoader />;
  if (!campaign) return null;

  const isWhatsApp = campaign.type === 'WhatsApp';
  const canSend    = campaign.status === 'Draft' && campaign.recipients.length > 0;

  const statusColor = {
    Sent:      'bg-green-100 text-green-700',
    Draft:     'bg-slate-100 text-slate-600',
    Sending:   'bg-amber-100 text-amber-700',
    Scheduled: 'bg-blue-100 text-blue-700',
    Failed:    'bg-red-100 text-red-700',
  }[campaign.status] ?? 'bg-slate-100 text-slate-600';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{campaign.title}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
              {campaign.status}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {campaign.type} Campaign · {campaign.recipients.length} recipient{campaign.recipients.length !== 1 ? 's' : ''}
            {campaign.sentAt ? ` · Sent ${formatDistanceToNow(new Date(campaign.sentAt))} ago` : ''}
          </p>
        </div>
        {canSend && (
          <Button onClick={() => setShowConfirm(true)}>
            <Send className="w-4 h-4" /> Send Now
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Recipients', value: campaign.recipientCount, icon: Users,        color: 'text-blue-600',  bg: 'bg-blue-50'  },
          { label: 'Sent',       value: campaign.sentCount,      icon: Send,         color: 'text-teal-700',  bg: 'bg-teal-50'  },
          { label: 'Opened',     value: campaign.openedCount,    icon: CheckCircle,  color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
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

      {/* Message Preview */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          {isWhatsApp
            ? <MessageCircle className="w-4 h-4 text-green-700" />
            : <Mail        className="w-4 h-4 text-blue-700"  />}
          Message
        </h2>
        {campaign.subject && (
          <p className="text-sm font-medium text-slate-700 mb-2">Subject: {campaign.subject}</p>
        )}
        {isWhatsApp ? (
          <div className="bg-[#e5ddd5] rounded-2xl p-4">
            <div className="flex justify-end">
              <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] shadow-sm">
                {(campaign.message || '').split('\n').map((line, i) => (
                  <p key={i} className="text-sm text-slate-800 leading-relaxed">{line || <br />}</p>
                ))}
                <p className="text-[10px] text-slate-400 text-right mt-1">✓✓</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {campaign.message || '(No message)'}
          </div>
        )}
      </Card>

      {/* Recipients */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-4">
          Recipients ({campaign.recipients.length})
        </h2>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {campaign.recipients.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-700 flex-shrink-0">
                {r.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-400">{r.phone || r.email || '—'}</p>
              </div>
              {r.isSent
                ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                : <span className="text-xs text-slate-300">Pending</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* WhatsApp tip for Draft */}
      {canSend && (
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
          <MessageCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">How sending works</p>
            <p className="text-xs text-green-700 mt-0.5">
              After you click Send Now, a guided wizard opens. You'll send each personalised
              WhatsApp message one-by-one — just click "Open WhatsApp" for each contact and
              hit send inside WhatsApp.
            </p>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {showConfirm && (
        <ConfirmSendDialog
          recipientCount={campaign.recipients.length}
          onConfirm={() => sendMutation.mutate()}
          onCancel={() => setShowConfirm(false)}
          loading={sendMutation.isPending}
        />
      )}

      {sendTargets && sendTargets.length > 0 && (
        <SendModal
          targets={sendTargets}
          onClose={() => setSendTargets(null)}
        />
      )}
    </div>
  );
}
