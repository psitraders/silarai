import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { TestimonialsSettings } from '../manifest';
import { QuoteCard } from '../Quote';
import { useQuotes } from '../quotes';

export default function Cards({ settings, blocks, context }: LayoutProps<TestimonialsSettings>) {
  const quotes = useQuotes(blocks);
  if (!quotes.length) return <EditorHint context={context} text="Add customer quotes to this section." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align="center" />
      <ul className="sf-gap grid @3xl:grid-cols-2 @5xl:grid-cols-3">
        {quotes.map(({ id, settings: q }) => <li key={id}><QuoteCard q={q} /></li>)}
      </ul>
    </div>
  );
}
