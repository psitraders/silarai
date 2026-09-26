import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Users, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { teamApi, type TeamMember } from '../../api/team.api';

const ROLE_LABEL: Record<string, string> = {
  TenantAdmin: 'Owner',
  BusinessAdmin: 'Business Admin',
};

const STATUS_BADGE = {
  Active: 'success',
  Invited: 'warning',
  Deactivated: 'default',
} as const;

type ApiError = { response?: { data?: { errors?: string[] } } };

function errorMessage(err: unknown, fallback: string) {
  return (err as ApiError)?.response?.data?.errors?.[0] ?? fallback;
}

/** TenantAdmin only (route-guarded): invite and manage Business Admins. */
export function TeamPage() {
  const qc = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { data: members, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: teamApi.list,
  });

  const flash = (msg: string, type: 'success' | 'error') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const inviteMut = useMutation({
    mutationFn: () => teamApi.invite({ name: name.trim(), email: email.trim() }),
    onSuccess: (m) => {
      qc.invalidateQueries({ queryKey: ['team'] });
      setInviteOpen(false);
      setName('');
      setEmail('');
      flash(`Invitation sent to ${m.email}.`, 'success');
    },
    onError: (err) => setInviteError(errorMessage(err, 'Failed to send invitation.')),
  });

  const resendMut = useMutation({
    mutationFn: (m: TeamMember) => teamApi.resendInvite(m.id),
    onSuccess: (_, m) => flash(`Invitation re-sent to ${m.email}.`, 'success'),
    onError: (err) => flash(errorMessage(err, 'Failed to re-send invitation.'), 'error'),
  });

  const statusMut = useMutation({
    mutationFn: ({ m, isActive }: { m: TeamMember; isActive: boolean }) => teamApi.setStatus(m.id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
    onError: (err) => flash(errorMessage(err, 'Failed to update admin.'), 'error'),
  });

  const openInvite = () => {
    setInviteError(null);
    setInviteOpen(true);
  };

  const submitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    inviteMut.mutate();
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Invite Business Admins to help run your store. They get the same access as you,
            except managing admins and changing your plan.
          </p>
        </div>
        <Button onClick={openInvite}>
          <UserPlus className="w-4 h-4 mr-1.5" /> Invite admin
        </Button>
      </div>

      {notice && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border ${
          notice.type === 'success'
            ? 'bg-green-50 border-green-100 text-green-700'
            : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {notice.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {notice.msg}
        </div>
      )}

      <Card padding="none">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
          <Users className="w-4 h-4 text-teal-600" />
          <h2 className="font-semibold text-slate-900">Members</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {(members ?? []).map((m) => {
            const isOwner = m.role === 'TenantAdmin';
            return (
              <li key={m.id} className="flex items-center justify-between gap-4 px-6 py-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 truncate">{m.name}</p>
                    <Badge variant={isOwner ? 'purple' : 'info'}>{ROLE_LABEL[m.role] ?? m.role}</Badge>
                    {!isOwner && <Badge variant={STATUS_BADGE[m.status]}>{m.status}</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{m.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {m.lastLoginAt
                      ? `Last login ${new Date(m.lastLoginAt).toLocaleDateString()}`
                      : `Added ${new Date(m.createdAt).toLocaleDateString()}`}
                  </p>
                </div>

                {!isOwner && (
                  <div className="flex items-center gap-2">
                    {m.status === 'Invited' && (
                      <Button
                        variant="outline"
                        size="sm"
                        loading={resendMut.isPending && resendMut.variables?.id === m.id}
                        onClick={() => resendMut.mutate(m)}
                      >
                        <Mail className="w-3.5 h-3.5 mr-1" /> Resend invite
                      </Button>
                    )}
                    {m.status === 'Deactivated' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        loading={statusMut.isPending && statusMut.variables?.m.id === m.id}
                        onClick={() => statusMut.mutate({ m, isActive: true })}
                      >
                        Reactivate
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={statusMut.isPending && statusMut.variables?.m.id === m.id}
                        onClick={() => {
                          if (window.confirm(`Deactivate ${m.name}? They will be signed out and can no longer log in.`)) {
                            statusMut.mutate({ m, isActive: false });
                          }
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Business Admin">
        <form onSubmit={submitInvite} className="space-y-4">
          {inviteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{inviteError}</div>
          )}
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText="They'll get an email link to set their password. The link expires in 7 days."
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button type="submit" loading={inviteMut.isPending}>Send invitation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
