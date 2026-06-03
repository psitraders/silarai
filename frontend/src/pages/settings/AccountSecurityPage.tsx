import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  User, Lock, Shield, Smartphone, Monitor, Tablet, LogOut,
  CheckCircle, AlertCircle, Loader2, Eye, EyeOff, QrCode, Mail,
} from 'lucide-react';
import { parseDeviceInfo } from '../../utils/deviceInfo';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

// ── Toast helper ──────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border ${
      type === 'success'
        ? 'bg-green-50 border-green-100 text-green-700'
        : 'bg-red-50 border-red-100 text-red-700'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg}
    </div>
  );
}

// ── Section: Profile ──────────────────────────────────────────────────────────
function ProfileSection() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const mut = useMutation({
    mutationFn: () => authApi.updateProfile({ name, phone }),
    onSuccess: () => {
      updateUser({ name });
      setToast({ msg: 'Profile updated.', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (err: any) => {
      setToast({ msg: err.response?.data?.errors?.[0] ?? 'Failed to update profile.', type: 'error' });
    },
  });

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-teal-600" />
        <h2 className="font-semibold text-slate-900">Profile</h2>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-500 block mb-1">Email</label>
          <p className="text-sm text-slate-900">{user?.email}</p>
        </div>
        <Input label="Display Name" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" />
        {toast && <Toast {...toast} />}
        <Button size="sm" onClick={() => mut.mutate()} loading={mut.isPending}>Save changes</Button>
      </div>
    </Card>
  );
}

// ── Section: Email Verification ───────────────────────────────────────────────
function EmailVerificationSection() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendVerification = async () => {
    setLoading(true);
    try {
      await authApi.sendVerification();
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-4 h-4 text-teal-600" />
        <h2 className="font-semibold text-slate-900">Email Verification</h2>
      </div>
      {sent ? (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
          <CheckCircle className="w-4 h-4" /> Verification email sent! Check your inbox.
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Verify your email to unlock all features.</p>
          <Button size="sm" variant="outline" onClick={sendVerification} loading={loading}>
            Send verification
          </Button>
        </div>
      )}
    </Card>
  );
}

// ── Section: Change Password ──────────────────────────────────────────────────
function ChangePasswordSection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const mut = useMutation({
    mutationFn: () => authApi.changePassword(current, next),
    onSuccess: () => {
      setCurrent(''); setNext(''); setConfirm('');
      setToast({ msg: 'Password changed successfully.', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (err: any) => {
      setToast({ msg: err.response?.data?.errors?.[0] ?? 'Failed to change password.', type: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) { setToast({ msg: 'New password must be at least 8 characters.', type: 'error' }); return; }
    if (next !== confirm) { setToast({ msg: 'Passwords do not match.', type: 'error' }); return; }
    mut.mutate();
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-teal-600" />
        <h2 className="font-semibold text-slate-900">Change Password</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Input
            label="Current password"
            type={showCurrent ? 'text' : 'password'}
            value={current}
            onChange={e => setCurrent(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(v => !v)}
            className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Input label="New password" type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="Min 8 characters" />
        <Input label="Confirm new password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" />
        {toast && <Toast {...toast} />}
        <Button type="submit" size="sm" loading={mut.isPending}>Update password</Button>
      </form>
    </Card>
  );
}

// ── Section: Two-Factor Authentication ───────────────────────────────────────
function TwoFactorSection() {
  const qc = useQueryClient();
  const [setupData, setSetupData] = useState<{ secret: string; otpAuthUri: string } | null>(null);
  const [code, setCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Fetch real 2FA status from backend on mount ───────────────────────────
  const { data: totpStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['totp-status'],
    queryFn: authApi.getTotpStatus,
    staleTime: 0,            // always re-fetch when page opens
  });
  const enabled = totpStatus?.enabled ?? false;

  const startSetup = async () => {
    setLoading(true);
    try {
      const data = await authApi.setupTotp();
      setSetupData(data);
    } catch {
      setToast({ msg: 'Failed to generate 2FA setup.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      await authApi.verifyTotp(code);
      qc.invalidateQueries({ queryKey: ['totp-status'] });  // re-sync with backend
      setSetupData(null);
      setCode('');
      setToast({ msg: '2FA enabled successfully.', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast({ msg: err.response?.data?.errors?.[0] ?? 'Invalid code.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      await authApi.disableTotp(disablePassword);
      qc.invalidateQueries({ queryKey: ['totp-status'] });  // re-sync with backend
      setShowDisable(false);
      setDisablePassword('');
      setToast({ msg: '2FA disabled.', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast({ msg: err.response?.data?.errors?.[0] ?? 'Incorrect password.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-teal-600" />
        <h2 className="font-semibold text-slate-900">Two-Factor Authentication</h2>
        {enabled && (
          <span className="ml-auto text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Enabled</span>
        )}
      </div>

      {statusLoading && (
        <div className="h-8 bg-slate-100 rounded-xl animate-pulse w-32" />
      )}

      {!statusLoading && !setupData && !enabled && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Add an extra layer of security. You'll need an authenticator app (Google Authenticator, Authy, etc.)</p>
          {toast && <Toast {...toast} />}
          <Button size="sm" variant="outline" onClick={startSetup} loading={loading}>
            <QrCode className="w-4 h-4 mr-1.5" /> Set up 2FA
          </Button>
        </div>
      )}

      {!statusLoading && setupData && !enabled && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            1. Open your authenticator app and scan the QR code, or enter the secret manually.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setupData.otpAuthUri)}`}
              alt="TOTP QR Code"
              className="mx-auto rounded-lg"
              width={180}
              height={180}
            />
            <div>
              <p className="text-xs text-slate-500 mb-1">Manual entry key</p>
              <code className="text-xs font-mono bg-white border border-slate-200 px-3 py-1.5 rounded-lg block break-all">
                {setupData.secret}
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">2. Enter the 6-digit code from your app to confirm setup.</p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button onClick={verifyCode} loading={loading} disabled={code.length !== 6}>
                Activate
              </Button>
            </div>
          </div>
          {toast && <Toast {...toast} />}
          <button onClick={() => setSetupData(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
        </div>
      )}

      {!statusLoading && enabled && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Your account is protected with two-factor authentication.</p>
          {toast && <Toast {...toast} />}
          {!showDisable ? (
            <Button size="sm" variant="outline" onClick={() => setShowDisable(true)} className="text-red-600 border-red-200 hover:bg-red-50">
              Disable 2FA
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                label="Confirm with your password"
                type="password"
                value={disablePassword}
                onChange={e => setDisablePassword(e.target.value)}
                placeholder="••••••••"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={disable2FA} loading={loading} className="bg-red-600 hover:bg-red-700">
                  Confirm disable
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowDisable(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Device icon helper ────────────────────────────────────────────────────────
function DeviceIcon({ os }: { os: string }) {
  const lower = os.toLowerCase();
  if (/iphone|android/.test(lower)) return <Smartphone className="w-5 h-5 text-slate-500" />;
  if (/ipad|tablet/.test(lower))    return <Tablet      className="w-5 h-5 text-slate-500" />;
  return                                    <Monitor     className="w-5 h-5 text-slate-500" />;
}

// ── Section: Active Sessions ──────────────────────────────────────────────────
function SessionsSection() {
  const qc = useQueryClient();
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: authApi.getSessions,
    staleTime: 30_000,
  });

  const revokeMut = useMutation({
    mutationFn: (id: string) => authApi.revokeSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="w-4 h-4 text-teal-600" />
        <h2 className="font-semibold text-slate-900">Active Sessions</h2>
        <span className="ml-auto text-xs text-slate-400">{sessions.length} active</span>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-slate-400">No active sessions found.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => {
            const { browser, os } = parseDeviceInfo(s.deviceInfo);
            const started  = new Date(s.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
            const expires  = new Date(s.expiresAt).toLocaleDateString(undefined,  { day: 'numeric', month: 'short', year: 'numeric' });
            return (
            <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border ${s.isCurrent ? 'bg-teal-50 border-teal-100' : 'bg-slate-50 border-transparent'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.isCurrent ? 'bg-teal-100' : 'bg-white border border-slate-200'}`}>
                  <DeviceIcon os={os} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">{browser}</p>
                    {s.isCurrent && (
                      <span className="text-[10px] bg-teal-500 text-white font-semibold px-1.5 py-0.5 rounded-full">Current</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {os} · Signed in {started} · Expires {expires}
                  </p>
                </div>
              </div>
              {!s.isCurrent && (
                <button
                  onClick={() => revokeMut.mutate(s.id)}
                  disabled={revokeMut.isPending}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Revoke session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function AccountSecurityPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account & Security</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your profile, password, and security settings.</p>
      </div>
      <ProfileSection />
      <EmailVerificationSection />
      <ChangePasswordSection />
      <TwoFactorSection />
      <SessionsSection />
    </div>
  );
}
