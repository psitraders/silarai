import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Zap, Camera, Globe, Send, CheckCircle2, XCircle,
  Clock, AlertTriangle, ChevronDown, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { businessApi, type AutoCampaignDto } from '../../api/business.api';

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  Pending:    { icon: <Clock className="h-4 w-4" />,          color: 'text-slate-500 bg-slate-100',  label: 'Pending' },
  Processing: { icon: <Clock className="h-4 w-4 animate-spin" />, color: 'text-amber-600 bg-amber-100', label: 'Processing' },
  Completed:  { icon: <CheckCircle2 className="h-4 w-4" />,   color: 'text-green-700 bg-green-100',  label: 'Completed' },
  Partial:    { icon: <AlertTriangle className="h-4 w-4" />,  color: 'text-amber-700 bg-amber-100',  label: 'Partial' },
  Failed:     { icon: <XCircle className="h-4 w-4" />,        color: 'text-red-700 bg-red-100',      label: 'Failed' },
};

function CampaignRow({ campaign }: { campaign: AutoCampaignDto }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.Pending;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="p-2 bg-purple-50 rounded-lg">
          <Zap className="h-4 w-4 text-purple-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900 text-sm">{campaign.productName}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
              {status.icon} {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {campaign.postedToInstagram && (
              <span className="flex items-center gap-1 text-xs text-pink-600">
                <Camera className="h-3 w-3" /> Posted
              </span>
            )}
            {campaign.postedToFacebook && (
              <span className="flex items-center gap-1 text-xs text-blue-600">
                <Globe className="h-3 w-3" /> Posted
              </span>
            )}
            {campaign.sentViaWhatsAppBroadcast && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Send className="h-3 w-3" /> {campaign.whatsAppRecipientsCount} sent
              </span>
            )}
            <span className="text-xs text-slate-400">
              {new Date(campaign.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>

        {expanded ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-4">
          {/* Generated content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Caption */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Generated Caption</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{campaign.generatedCaption}</p>
            </div>

            {/* Hashtags + CTA */}
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Hashtags</p>
                <p className="text-xs text-purple-600">{campaign.generatedHashtags}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Call-to-Action</p>
                <p className="text-sm text-slate-700 font-medium">{campaign.generatedCta}</p>
              </div>
            </div>
          </div>

          {/* Image */}
          {campaign.generatedImageUrl && (
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-slate-400" />
              <a
                href={campaign.generatedImageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-teal-600 hover:underline truncate"
              >
                {campaign.generatedImageUrl}
              </a>
            </div>
          )}

          {/* Channel results */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`rounded-lg p-3 flex items-center gap-2 ${campaign.postedToInstagram ? 'bg-pink-50' : 'bg-slate-100'}`}>
              <Camera className={`h-4 w-4 ${campaign.postedToInstagram ? 'text-pink-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-medium text-slate-700">Instagram</p>
                <p className={`text-xs ${campaign.postedToInstagram ? 'text-pink-600' : 'text-slate-400'}`}>
                  {campaign.postedToInstagram ? `ID: ${campaign.instagramPostId}` : 'Not posted'}
                </p>
              </div>
            </div>
            <div className={`rounded-lg p-3 flex items-center gap-2 ${campaign.postedToFacebook ? 'bg-blue-50' : 'bg-slate-100'}`}>
              <Globe className={`h-4 w-4 ${campaign.postedToFacebook ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-medium text-slate-700">Facebook</p>
                <p className={`text-xs ${campaign.postedToFacebook ? 'text-blue-600' : 'text-slate-400'}`}>
                  {campaign.postedToFacebook ? `ID: ${campaign.facebookPostId}` : 'Not posted'}
                </p>
              </div>
            </div>
            <div className={`rounded-lg p-3 flex items-center gap-2 ${campaign.sentViaWhatsAppBroadcast ? 'bg-green-50' : 'bg-slate-100'}`}>
              <Send className={`h-4 w-4 ${campaign.sentViaWhatsAppBroadcast ? 'text-green-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-medium text-slate-700">WhatsApp</p>
                <p className={`text-xs ${campaign.sentViaWhatsAppBroadcast ? 'text-green-600' : 'text-slate-400'}`}>
                  {campaign.sentViaWhatsAppBroadcast ? `${campaign.whatsAppRecipientsCount} sent` : 'Not sent'}
                </p>
              </div>
            </div>
          </div>

          {/* Error log */}
          {campaign.errorLog && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> Errors
              </p>
              <p className="text-xs text-red-600">{campaign.errorLog}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AiCampaignsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['auto-campaigns', page],
    queryFn: () => businessApi.getAutoCampaigns({ page, pageSize: 20 }),
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="h-6 w-6 text-purple-600" />
          Auto-Campaign History
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Every marketing campaign launched automatically when a product was published.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : data?.items.length === 0 ? (
        <Card>
          <div className="py-12 text-center space-y-2">
            <Zap className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-medium">No auto-campaigns yet</p>
            <p className="text-sm text-slate-400">
              Enable <strong>Auto-Campaign</strong> in <strong>AI → Autopilot</strong>, then publish a product to see it here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.items.map((campaign) => (
            <CampaignRow key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
