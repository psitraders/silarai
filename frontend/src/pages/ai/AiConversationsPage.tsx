import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare, User, Phone, Mail, MapPin, ShoppingCart,
  ChevronDown, ChevronRight, Filter
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { businessApi, type ConversationSessionDto } from '../../api/business.api';

const STATE_BADGE: Record<string, { label: string; color: string }> = {
  Greeting:       { label: 'Greeting',     color: 'bg-slate-100 text-slate-600' },
  Discovery:      { label: 'Browsing',     color: 'bg-blue-100 text-blue-700' },
  Interested:     { label: 'Interested',   color: 'bg-purple-100 text-purple-700' },
  CollectingInfo: { label: 'Collecting',   color: 'bg-amber-100 text-amber-700' },
  Confirming:     { label: 'Confirming',   color: 'bg-orange-100 text-orange-700' },
  Ordered:        { label: 'Ordered ✓',   color: 'bg-green-100 text-green-700' },
  Closed:         { label: 'Closed',       color: 'bg-slate-100 text-slate-500' },
};

function SessionRow({ session }: { session: ConversationSessionDto }) {
  const [expanded, setExpanded] = useState(false);

  const badge = STATE_BADGE[session.state] ?? { label: session.state, color: 'bg-slate-100 text-slate-600' };

  let messages: { role: string; content: string }[] = [];
  try { messages = JSON.parse(session.messagesJson); } catch { /* empty */ }

  const channelIcon = session.channel === 'Instagram' ? '📸'
    : session.channel === 'Facebook' ? '📘'
    : '📱';

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Row header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className={`p-2 rounded-lg ${session.isActive ? 'bg-teal-50' : 'bg-slate-100'}`}>
          <MessageSquare className={`h-4 w-4 ${session.isActive ? 'text-teal-600' : 'text-slate-400'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900 text-sm">
              {channelIcon} {session.collectedName || session.externalCustomerId}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
              {badge.label}
            </span>
            {session.isActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">
                Closed
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
            {session.collectedPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{session.collectedPhone}</span>}
            <span>{session.messageCount} messages</span>
            <span>{new Date(session.lastMessageAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
        </div>

        {expanded ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-4">
          {/* Collected info */}
          <div className="grid grid-cols-2 gap-3">
            {session.collectedName && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{session.collectedName}</span>
              </div>
            )}
            {session.collectedPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{session.collectedPhone}</span>
              </div>
            )}
            {session.collectedEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{session.collectedEmail}</span>
              </div>
            )}
            {session.collectedAddress && (
              <div className="flex items-center gap-2 text-sm col-span-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-700">{session.collectedAddress}</span>
              </div>
            )}
          </div>

          {/* Cart */}
          {session.cartJson && session.cartJson !== '[]' && (
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                <ShoppingCart className="h-3.5 w-3.5" /> Cart Items
              </p>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap">{session.cartJson}</pre>
            </div>
          )}

          {/* Conversation messages */}
          {messages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Conversation</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs rounded-2xl px-3 py-2 text-xs ${
                        msg.role === 'assistant'
                          ? 'bg-white border border-slate-200 text-slate-700'
                          : 'bg-teal-600 text-white'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AiConversationsPage() {
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['conversations', page, activeFilter],
    queryFn: () => businessApi.getConversations({ page, pageSize: 20, activeOnly: activeFilter }),
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-teal-600" />
            AI Conversations
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            All autonomous AI conversations with your customers across channels.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        {[
          { label: 'All', value: undefined },
          { label: 'Active', value: true },
          { label: 'Closed', value: false },
        ].map((opt) => (
          <button
            key={String(opt.label)}
            type="button"
            onClick={() => { setActiveFilter(opt.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === opt.value
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {data && (
          <span className="ml-auto text-sm text-slate-400">{data.total} total</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : data?.items.length === 0 ? (
        <Card>
          <div className="py-12 text-center space-y-2">
            <MessageSquare className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-medium">No conversations yet</p>
            <p className="text-sm text-slate-400">
              Enable AI Auto-Reply in <strong>AI → Autopilot</strong> to start autonomous conversations.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.items.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </div>
      )}

      {/* Pagination */}
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
