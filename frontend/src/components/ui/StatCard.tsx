import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
  gradient?: string;
}

export function StatCard({
  title, value, change, changeLabel, icon, iconBg, className, gradient,
}: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  if (gradient) {
    return (
      <div className={clsx(
        'relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300',
        gradient, className,
      )}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative">
          {icon && (
            <div className={clsx('inline-flex w-10 h-10 rounded-xl items-center justify-center mb-4', iconBg ?? 'bg-white/20')}>
              {icon}
            </div>
          )}
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
          <p className="text-white text-3xl font-extrabold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className={clsx('flex items-center gap-1 mt-2 text-xs font-semibold', isPositive ? 'text-white/90' : 'text-red-200')}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}{change}%</span>
              {changeLabel && <span className="text-white/50 font-normal">{changeLabel}</span>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300',
      className,
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
          {change !== undefined && (
            <div className={clsx(
              'flex items-center gap-1 mt-2 text-xs font-semibold',
              isPositive ? 'text-green-600' : 'text-red-500',
            )}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}{change}%</span>
              {changeLabel && <span className="text-slate-400 font-normal">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center shadow-sm', iconBg ?? 'bg-teal-50')}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
