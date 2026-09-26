import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquareQuote, Lock, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth.api';

/** Public: an invited Business Admin sets their password from the emailed link. */
export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authApi.acceptInvite(token, password);
      setDone(true);
    } catch (err) {
      const apiErr = err as { response?: { data?: { errors?: string[] } } };
      setError(apiErr.response?.data?.errors?.[0] ?? 'Invalid or expired invitation link.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-slate-500 text-center">
          Invalid invitation link. Ask the store owner to re-send your invitation, or <Link to="/login" className="text-teal-700 underline">sign in</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-700 rounded-2xl mb-4">
            <MessageSquareQuote className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Accept your invitation</h1>
          <p className="text-slate-500 mt-1">Set a password to start managing the store</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">You're all set!</p>
                <p className="text-sm text-slate-500 mt-1">Sign in with your email and new password.</p>
              </div>
              <Button className="w-full" onClick={() => navigate('/login')}>Sign in</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
              )}
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Re-enter password"
                leftIcon={<Lock className="w-4 h-4" />}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" loading={loading} size="lg">
                Set password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
