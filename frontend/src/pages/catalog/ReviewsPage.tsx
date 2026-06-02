import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Check, X, Trash2, MessageSquare } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { reviewsApi } from '../../api/reviews.api';
import { formatDate } from '../../utils/formatDate';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

export function ReviewsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', filter],
    queryFn: () => reviewsApi.getAll(filter === 'all' ? {} : { approved: filter === 'approved' }),
  });

  const approveMutation = useMutation({ mutationFn: reviewsApi.approve, onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }) });
  const rejectMutation = useMutation({ mutationFn: reviewsApi.reject, onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }) });
  const deleteMutation = useMutation({ mutationFn: reviewsApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }) });

  if (isLoading) return <PageLoader />;

  const pending = reviews.filter(r => !r.isApproved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Reviews</h1>
          <p className="text-slate-500 text-sm mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''}{pending > 0 && ` · ${pending} pending`}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {f}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <EmptyState icon={<MessageSquare className="w-8 h-8 text-slate-400" />} title="No reviews yet" description="Customer reviews appear here once they submit them from your storefront." />
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <Card key={r.id}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                  {r.reviewerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{r.reviewerName}</span>
                    {r.reviewerEmail && <span className="text-xs text-slate-400">{r.reviewerEmail}</span>}
                    <Badge variant={r.isApproved ? 'success' : 'warning'}>{r.isApproved ? 'Approved' : 'Pending'}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={r.rating} />
                    <span className="text-xs text-slate-400">on <span className="font-medium text-slate-600">{r.productTitle}</span></span>
                    <span className="text-xs text-slate-400">· {formatDate(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="text-sm text-slate-700 mt-2">{r.comment}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!r.isApproved && (
                    <button onClick={() => approveMutation.mutate(r.id)} title="Approve" className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {r.isApproved && (
                    <button onClick={() => rejectMutation.mutate(r.id)} title="Un-approve" className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteMutation.mutate(r.id)} title="Delete" className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
