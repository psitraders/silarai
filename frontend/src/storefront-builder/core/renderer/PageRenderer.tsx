import type { PageLayout, RenderContext } from '../types';
import { SectionFrame } from './SectionFrame';

/** Draws a page layout: sections in order, each isolated in its own frame. */
export function PageRenderer({ layout, page, mode = 'live' }: {
  layout: PageLayout;
  page: RenderContext['page'];
  mode?: RenderContext['mode'];
}) {
  return (
    <main id="sf-main" tabIndex={-1} className="outline-none">
      {layout.sections.filter(s => !s.hidden).map((section, i) => (
        <SectionFrame key={section.id} instance={section} context={{ mode, page, isFirst: i === 0 }} />
      ))}
    </main>
  );
}
