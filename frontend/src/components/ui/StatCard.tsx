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
}

export function StatCard({ title, value, change, changeLabel, icon, iconBg, className }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className={clsx('bg-white rounded-2xl border border-slate-100 shadow-sm p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          {change !== undefined && (
            <div className={clsx('flex items-center gap-1 mt-2 text-xs font-medium',
              isPositive ? 'text-green-600' : 'text-red-600')}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}{change}%</span>
              {changeLabel && <span className="text-slate-400 font-normal">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', iconBg ?? 'bg-teal-50')}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
