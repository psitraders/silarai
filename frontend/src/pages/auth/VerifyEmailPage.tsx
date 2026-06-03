import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageSquareQuote, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth.api';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.response?.data?.errors?.[0] ?? 'Invalid or expired verification link.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-700 rounded-2xl mb-4">
            <MessageSquareQuote className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-10 h-10 text-teal-600 mx-auto animate-spin" />
              <p className="text-slate-600">Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xl font-bold text-slate-900">Email verified!</p>
              <p className="text-sm text-slate-500">Your email has been verified successfully.</p>
              <Link to="/dashboard" className="inline-block mt-2 text-teal-700 font-medium hover:underline">
                Go to dashboard →
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">Verification failed</p>
              <p className="text-sm text-slate-500">{message}</p>
              <Link to="/dashboard" className="inline-block mt-2 text-teal-700 font-medium hover:underline">
                Return to dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
