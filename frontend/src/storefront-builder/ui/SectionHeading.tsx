import type { ReactNode } from 'react';

/** Standard section header: eyebrow, title, subtitle, optional action on the right. */
export function SectionHeading({
  eyebrow, title, subtitle, action, align = 'left', as = 'h2',
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
}) {
  if (!eyebrow && !title && !subtitle && !action) return null;
  const Heading = as;
  return (
    <div className={`mb-6 flex flex-wrap items-end gap-4 ${align === 'center' ? 'justify-center text-center' : 'justify-between'}`}>
      <div className={align === 'center' ? 'max-w-2xl' : 'max-w-3xl'}>
        {eyebrow && <p className="sf-eyebrow mb-2">{eyebrow}</p>}
        {title && <Heading className={as === 'h1' ? 'sf-h1' : 'sf-h2'}>{title}</Heading>}
        {subtitle && <p className="sf-muted mt-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
