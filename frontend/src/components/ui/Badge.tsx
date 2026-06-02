import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function getLeadStatusBadge(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    NewInquiry: 'info',
    PriceShared: 'purple',
    Interested: 'success',
    FollowUpPending: 'warning',
    OrderConfirmed: 'success',
    Lost: 'danger',
    RepeatOpportunity: 'default',
  };
  return map[status] ?? 'default';
}

export function getOrderStatusBadge(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    New: 'info',
    Confirmed: 'purple',
    PaymentPending: 'warning',
    Paid: 'success',
    Packed: 'default',
    Delivered: 'success',
    Cancelled: 'danger',
  };
  return map[status] ?? 'default';
}
