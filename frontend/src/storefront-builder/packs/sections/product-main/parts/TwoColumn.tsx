import type { ReactNode } from 'react';

const COLS = {
  even: '@3xl:grid-cols-2',
  'gallery-wide': '@3xl:grid-cols-[1.25fr_1fr]',
  'gallery-wider': '@3xl:grid-cols-[1.5fr_1fr]',
} as const;

/** Gallery + details side by side on wide containers, stacked on phones. */
export function TwoColumn({ gallery, info, cols = 'even', reverse = false, stickyInfo = false, stickyGallery = false }: {
  gallery: ReactNode;
  info: ReactNode;
  cols?: keyof typeof COLS;
  /** Details on the left (mirrored). */
  reverse?: boolean;
  /** Details stay in view while long galleries scroll. */
  stickyInfo?: boolean;
  stickyGallery?: boolean;
}) {
  const sticky = '@3xl:sticky @3xl:top-[calc(var(--sf-header-h,0px)+1.5rem)] @3xl:self-start';
  return (
    <div className={`grid gap-8 @3xl:gap-12 ${COLS[cols]}`}>
      <div className={`min-w-0 ${reverse ? '@3xl:order-2' : ''} ${stickyGallery ? sticky : ''}`}>{gallery}</div>
      <div className={`min-w-0 ${stickyInfo ? sticky : ''}`}>{info}</div>
    </div>
  );
}
