import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, RotateCcw, Bot, User, MessageCircle, Info, ChevronDown } from 'lucide-react';
import apiClient from '../../api/client';

// ── Types ─────────────────────────────────────────────────────────────────────

type Channel = 'WhatsApp' | 'Facebook' | 'Instagram';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  ts: Date;
  sessionState?: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

const simulateMessage = (message: string, channel: Channel) =>
  apiClient.post<{ reply: string; sessionState: string; isNewSession: boolean }>(
    '/chatbot/simulate',
    { message, channel, senderName: 'You' }
  ).then(r => r.data);

const resetSimulator = () =>
  apiClient.delete('/chatbot/simulate').then(r => r.data);

// ── Channel config ────────────────────────────────────────────────────────────

const CHANNELS: { value: Channel; label: string; color: string; bg: string }[] = [
  { value: 'WhatsApp',  label: 'WhatsApp',  color: 'text-green-700',  bg: 'bg-green-600'  },
  { value: 'Facebook',  label: 'Facebook',  color: 'text-blue-700',   bg: 'bg-blue-600'   },
  { value: 'Instagram', label: 'Instagram', color: 'text-pink-700',   bg: 'bg-pink-600'   },
];

const STATE_LABELS: Record<string, string> = {
  Greeting:      '👋 Greeting',
  Discovery:     '🔍 Exploring products',
  Interested:    '💡 Interested',
  CollectingInfo:'📋 Collecting info',
  Confirming:    '✅ Confirming order',
  Ordered:       '🎉 Order placed',
  Closed:        '🔚 Closed',
};

// ── Bubble ────────────────────────────────────────────────────────────────────

function Bubble({ msg, channelBg }: { msg: Message; channelBg: string }) {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex items-end gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className={`w-7 h-7 rounded-full ${channelBg} flex items-center justify-center flex-shrink-0 mb-1`}>
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[75%] space-y-1`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isBot
              ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
              : 'bg-teal-600 text-white rounded-tr-sm'
          }`}
        >
          {msg.text}
        </div>
        <div className={`flex items-center gap-2 px-1 ${isBot ? 'justify-start' : 'justify-end'}`}>
          <span className="text-[10px] text-slate-400">
            {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isBot && msg.sessionState && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
              {STATE_LABELS[msg.sessionState] ?? msg.sessionState}
            </span>
          )}
        </div>
      </div>
      {!isBot && (
        <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mb-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ChatbotSimulatorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [channel, setChannel] = useState<Channel>('WhatsApp');
  const [showInfo, setShowInfo] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const channelCfg = CHANNELS.find(c => c.value === channel)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: ({ text, ch }: { text: string; ch: Channel }) =>
      simulateMessage(text, ch),
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id:           crypto.randomUUID(),
        role:         'bot',
        text:         data.reply,
        ts:           new Date(),
        sessionState: data.sessionState,
      }]);
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const data   = err?.response?.data;
      const detail = data?.error ?? data?.detail ?? data?.title ?? err?.message ?? 'Unknown error';
      const hint = status === 404
        ? 'Backend not deployed yet — wait a minute and try again.'
        : detail;
      setMessages(prev => [...prev, {
        id:   crypto.randomUUID(),
        role: 'bot',
        text: `⚠️ ${hint}`,
        ts:   new Date(),
      }]);
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetSimulator,
    onSuccess: () => {
      setMessages([]);
      setInput('');
    },
  });

  const send = () => {
    const text = input.trim();
    if (!text || sendMutation.isPending) return;

    setMessages(prev => [...prev, {
      id:   crypto.randomUUID(),
      role: 'user',
      text,
      ts:   new Date(),
    }]);
    setInput('');
    sendMutation.mutate({ text, ch: channel });
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const lastState = [...messages].reverse().find(m => m.role === 'bot')?.sessionState;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className={`${channelCfg.bg} rounded-t-2xl px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">AI Chatbot Simulator</p>
            <p className="text-white/70 text-xs">
              {lastState ? (STATE_LABELS[lastState] ?? lastState) : 'Start typing to test your bot'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Channel selector */}
          <div className="relative">
            <select
              value={channel}
              onChange={e => setChannel(e.target.value as Channel)}
              className="appearance-none bg-white/20 text-white text-xs font-medium pl-3 pr-7 py-1.5 rounded-lg border border-white/30 focus:outline-none cursor-pointer"
            >
              {CHANNELS.map(c => (
                <option key={c.value} value={c.value} className="text-slate-900 bg-white">
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none" />
          </div>

          <button
            onClick={() => setShowInfo(s => !s)}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Info className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending || messages.length === 0}
            title="Reset conversation"
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-40"
          >
            <RotateCcw className={`w-4 h-4 text-white ${resetMutation.isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Info banner */}
      {showInfo && (
        <div className="bg-blue-50 border-x border-blue-100 px-4 py-3 text-xs text-blue-800 space-y-1">
          <p className="font-semibold">How the simulator works</p>
          <p>• Runs your <strong>real AI chatbot pipeline</strong> — same products, same context, same AI model</p>
          <p>• Messages are <strong>never sent</strong> to WhatsApp / Facebook / Instagram</p>
          <p>• Conversation memory is preserved between messages (like a real chat)</p>
          <p>• Click 🔄 to reset and start a fresh conversation</p>
          <p>• <strong>AutoReply toggle</strong> is bypassed — the bot always replies here</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 border-x border-slate-200 px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="font-medium text-slate-500">Test your AI chatbot</p>
              <p className="text-xs mt-1">Type a message below — your bot will reply instantly</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-left space-y-1.5 text-xs text-slate-500 max-w-xs">
              <p className="font-semibold text-slate-700">Try saying:</p>
              {[
                'Hi, what products do you sell?',
                'Do you have anything under ₹500?',
                'I want to place an order',
                'What are your delivery charges?',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="block w-full text-left hover:text-teal-600 hover:underline transition-colors"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <Bubble key={msg.id} msg={msg} channelBg={channelCfg.bg} />
        ))}

        {sendMutation.isPending && (
          <div className="flex items-end gap-2 justify-start">
            <div className={`w-7 h-7 rounded-full ${channelCfg.bg} flex items-center justify-center flex-shrink-0`}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-b-2xl px-3 py-3 flex items-end gap-2">
        <textarea
          ref={inputRef}
          rows={1}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 resize-none text-sm border-0 outline-none bg-transparent text-slate-800 placeholder:text-slate-400 max-h-32 leading-relaxed"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
          disabled={sendMutation.isPending}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sendMutation.isPending}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
            input.trim() && !sendMutation.isPending
              ? `${channelCfg.bg} text-white shadow-sm hover:opacity-90`
              : 'bg-slate-100 text-slate-400'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
