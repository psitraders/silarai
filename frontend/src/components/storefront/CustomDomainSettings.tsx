import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Globe, CheckCircle, Clock, XCircle, RefreshCw, Trash2, Copy, ExternalLink, Server } from 'lucide-react';
import { customDomainApi } from '../../api/customDomain.api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function CustomDomainSettings() {
  const qc = useQueryClient();
  const [domainInput, setDomainInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['custom-domain'],
    queryFn: customDomainApi.get,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'pending' || s === 'awaiting_nameservers' ? 15000 : false;
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => customDomainApi.save(domainInput),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['custom-domain'] }); setDomainInput(''); },
  });

  const removeMutation = useMutation({
    mutationFn: customDomainApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-domain'] }),
  });

  const refreshMutation = useMutation({
    mutationFn: customDomainApi.refresh,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-domain'] }),
  });

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  if (isLoading) return null;

  const hasDomain  = data?.hasDomain;
  const status     = data?.status;
  const setupType  = data?.setupType; // "www" | "apex"
  const isApex     = setupType === 'apex';
  const isWww      = !isApex;

  // Detect if user typed apex vs www for live hint
  const inputIsApex = domainInput.trim() && !domainInput.trim().startsWith('www.');

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
          <Globe className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Custom Domain</h2>
          <p className="text-sm text-gray-500">Point your own domain to your Silarai store</p>
        </div>
      </div>

      {!hasDomain ? (
        /* ── Connect domain form ── */
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Enter your domain below. Both <span className="font-semibold">floraved.com</span> and{' '}
            <span className="font-semibold">www.floraved.com</span> are supported.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="floraved.com or www.floraved.com"
              value={domainInput}
              onChange={e => setDomainInput(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => saveMutation.mutate()}
              loading={saveMutation.isPending}
              disabled={!domainInput.trim()}
            >
              Connect
            </Button>
          </div>

          {/* Live hint based on what they're typing */}
          {inputIsApex && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
              <p className="font-semibold mb-1">📋 Apex domain detected</p>
              <p>
                After connecting, we'll create a Cloudflare zone for your domain and give you{' '}
                <strong>2 nameservers</strong> to update at your registrar (GoDaddy, Namecheap, etc.).
                This is a one-time 2-minute step — no technical knowledge needed.
              </p>
            </div>
          )}
          {domainInput.trim() && !inputIsApex && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
              <p className="font-semibold mb-1">📋 www domain detected</p>
              <p>
                After connecting, add a <strong>CNAME record</strong> at your registrar pointing{' '}
                <code className="bg-blue-100 px-1 rounded">www</code> → <code className="bg-blue-100 px-1 rounded">cname.Silarai.app</code>.
              </p>
            </div>
          )}

          {saveMutation.isError && (
            <p className="text-sm text-red-500 mt-2">
              {(saveMutation.error as any)?.response?.data?.error ?? 'Something went wrong'}
            </p>
          )}
        </div>
      ) : (
        /* ── Domain registered ── */
        <div className="space-y-5">
          {/* Status badge + actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{data.domain}</span>
              {status === 'active' && (
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                  <CheckCircle className="w-3.5 h-3.5" /> Active
                </span>
              )}
              {status === 'pending' && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> Verifying SSL
                </span>
              )}
              {status === 'awaiting_nameservers' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                  <Server className="w-3.5 h-3.5" /> Awaiting Nameservers
                </span>
              )}
              {status === 'failed' && (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200">
                  <XCircle className="w-3.5 h-3.5" /> Failed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {status === 'active' && (
                <a href={`https://${data.domain}`} target="_blank" rel="noreferrer"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  Visit <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <Button variant="ghost" size="sm" onClick={() => refreshMutation.mutate()} loading={refreshMutation.isPending}>
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost" size="sm"
                onClick={() => removeMutation.mutate()}
                loading={removeMutation.isPending}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* ── APEX: awaiting nameservers ── */}
          {status === 'awaiting_nameservers' && isApex && data.nameservers && (
            <NameserverInstructions domain={data.domain!} nameservers={data.nameservers} copy={copy} copied={copied} />
          )}

          {/* ── WWW: awaiting CNAME ── */}
          {status === 'pending' && isWww && (
            <CnameInstructions domain={data.domain!} cnameTarget={data.cnameTarget!} copy={copy} copied={copied} />
          )}

          {/* ── Pending SSL (both apex + www after CNAME added) ── */}
          {status === 'pending' && isApex && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">⚡ Nameservers verified — provisioning SSL certificate</p>
              <p className="text-xs">This usually takes 5–15 minutes. We'll check automatically every 15 seconds.</p>
            </div>
          )}

          {/* ── Active ── */}
          {status === 'active' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                ✅ Your store is live at{' '}
                <a href={`https://${data.domain}`} target="_blank" rel="noreferrer"
                  className="font-semibold underline">https://{data.domain}</a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function NameserverInstructions({
  domain, nameservers, copy, copied,
}: {
  domain: string;
  nameservers: string[];
  copy: (text: string, key: string) => void;
  copied: string | null;
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-blue-900 mb-1">
        ⚡ Action required — update nameservers at your registrar
      </p>
      <p className="text-xs text-blue-800 mb-3">
        Log in to GoDaddy / Namecheap / wherever you bought <strong>{domain}</strong>.
        Go to <strong>DNS / Nameservers</strong> and set these two nameservers (remove the old ones):
      </p>
      <div className="bg-white rounded-lg border border-blue-200 divide-y divide-blue-100">
        {nameservers.map((ns, i) => (
          <div key={ns} className="flex items-center justify-between px-3 py-2">
            <span className="font-mono text-xs font-semibold text-gray-800">
              NS {i + 1}: {ns}
            </span>
            <button onClick={() => copy(ns, `ns-${i}`)} className="text-teal-600 hover:text-teal-700 ml-2">
              {copied === `ns-${i}` ? (
                <span className="text-xs text-green-600">Copied!</span>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-blue-700 mt-3">
        After saving at your registrar, click <strong>Refresh</strong> above. Propagation takes 1–24 hours.
        Once confirmed, your SSL certificate is auto-provisioned and the domain goes live. 🚀
      </p>
    </div>
  );
}

function CnameInstructions({
  domain, cnameTarget, copy, copied,
}: {
  domain: string;
  cnameTarget: string;
  copy: (text: string, key: string) => void;
  copied: string | null;
}) {
  const nameField = domain.startsWith('www.') ? 'www' : domain;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-amber-800 mb-3">
        ⚡ Action required — add this DNS record at your domain registrar:
      </p>
      <div className="bg-white rounded-lg border border-amber-200 p-3 font-mono text-xs">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-gray-400 mb-0.5">Type</p>
            <p className="font-semibold text-gray-800">CNAME</p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">Name</p>
            <p className="font-semibold text-gray-800">{nameField}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">Value</p>
            <div className="flex items-center gap-1">
              <p className="font-semibold text-gray-800 truncate">{cnameTarget}</p>
              <button onClick={() => copy(cnameTarget, 'cname')} className="text-teal-600 hover:text-teal-700 shrink-0">
                {copied === 'cname' ? <span className="text-green-600 text-[10px]">Copied!</span> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-amber-700 mt-3">
        DNS changes can take up to 24 hours. Click the refresh button to check status.
      </p>
    </div>
  );
}

