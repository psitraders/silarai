import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { aiApi } from '../../api/ai.api';

const toneModes = ['Friendly', 'Premium', 'Short', 'Persuasive'];

export function AiRepliesPage() {
  const [question, setQuestion] = useState('');
  const [toneMode, setToneMode] = useState('Friendly');
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () => aiApi.getSuggestion({
      customerQuestion: question,
      toneMode,
    }),
    onSuccess: (data) => { setResult(data.reply); setAiError(null); },
    onError: (err: any) => {
      const msg = err?.response?.data?.errors?.[0]
        ?? err?.response?.data?.message
        ?? 'Failed to generate reply. Please try again.';
      setAiError(msg);
    },
  });

  const copy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Reply Suggestions</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Generate professional replies for customer inquiries instantly.
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Customer's Message
            </label>
            <textarea
              rows={4}
              placeholder="e.g., Hi, I want to know the price of the red silk saree. Do you have it in blue color?"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Tone</label>
            <div className="flex gap-2 flex-wrap">
              {toneModes.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setToneMode(tone)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    toneMode === tone
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => mutate()}
            loading={isPending}
            disabled={!question.trim()}
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-4 h-4" />
            Generate Reply
          </Button>

          {aiError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {aiError}
            </p>
          )}
        </div>
      </Card>

      {result && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700" />
              Suggested Reply
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => mutate()}>
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {result}
          </div>

          {/* Quick send options */}
          <div className="flex gap-2 mt-4">
            <span className="text-xs text-slate-500 font-medium mt-1">Quick replies:</span>
            {['Yes, we have 5 colors.', 'Sure, sending options.', 'What color do you prefer?'].map((s) => (
              <button
                key={s}
                className="text-xs px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
