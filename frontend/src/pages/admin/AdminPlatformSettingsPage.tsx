import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import apiClient from '../../api/client';

interface PlatformSettingDto {
  id: string;
  key: string;
  value: string;
  updatedAt?: string;
}

const KNOWN_SETTINGS = [
  {
    key: 'TwoFactor:ApiKey',
    label: '2Factor.in API Key',
    hint: 'Used for sending SMS OTP during mobile login. Get yours at 2factor.in',
    sensitive: true,
  },
];

function SettingRow({ setting }: { setting: PlatformSettingDto }) {
  const qc = useQueryClient();
  const meta = KNOWN_SETTINGS.find(s => s.key === setting.key);
  const [value, setValue]     = useState(setting.value);
  const [show, setShow]       = useState(false);
  const [saved, setSaved]     = useState(false);

  const mutation = useMutation({
    mutationFn: (v: string) =>
      apiClient.put(`/admin/platform-settings/${encodeURIComponent(setting.key)}`, { value: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const label = meta?.label ?? setting.key;
  const hint  = meta?.hint;
  const isSensitive = meta?.sensitive ?? false;

  return (
    <div className="py-5 first:pt-0 last:pb-0 border-b border-slate-100 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{setting.key}</p>
          {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        </div>
        {setting.updatedAt && (
          <span className="text-xs text-slate-400 shrink-0 mt-0.5">
            Updated {new Date(setting.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={isSensitive && !show ? 'password' : 'text'}
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
            placeholder={`Enter ${label}`}
          />
          {isSensitive && (
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        <Button
          size="sm"
          loading={mutation.isPending}
          disabled={value === setting.value || !value.trim()}
          onClick={() => mutation.mutate(value.trim())}
        >
          {saved ? <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Saved</> : <><Save className="w-3.5 h-3.5 mr-1" /> Save</>}
        </Button>
      </div>
      {mutation.isError && (
        <p className="text-xs text-red-500 mt-1">Failed to save. Please try again.</p>
      )}
    </div>
  );
}

export function AdminPlatformSettingsPage() {
  const { data, isLoading } = useQuery<PlatformSettingDto[]>({
    queryKey: ['platform-settings'],
    queryFn: () => apiClient.get('/admin/platform-settings').then(r => r.data),
  });

  if (isLoading) return <PageLoader />;

  // Merge known settings (ensures all appear even if not in DB yet)
  const allSettings: PlatformSettingDto[] = KNOWN_SETTINGS.map(meta => {
    const existing = data?.find(s => s.key === meta.key);
    return existing ?? { id: '', key: meta.key, value: '', updatedAt: undefined };
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-700" />
          Platform Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Global configuration for the Silarai platform. Changes take effect immediately.
        </p>
      </div>

      <Card>
        <h2 className="font-semibold text-slate-900 mb-1">OTP / SMS</h2>
        <p className="text-xs text-slate-400 mb-5">
          Used for mobile-number login. Merchants sign in without needing their password.
        </p>
        <div>
          {allSettings.map(s => <SettingRow key={s.key} setting={s} />)}
        </div>
      </Card>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <strong>Note:</strong> These settings are platform-wide and apply to all tenants.
        Only SuperAdmins can view or change them.
      </div>
    </div>
  );
}

