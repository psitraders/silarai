import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-slate-100 shadow-sm',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
