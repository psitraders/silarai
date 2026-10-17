import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { Scroller } from '../../../../ui/Scroller';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { TestimonialsSettings } from '../manifest';
import { QuoteCard } from '../Quote';
import { useQuotes } from '../quotes';

export default function Carousel({ settings, blocks, context }: LayoutProps<TestimonialsSettings>) {
  const quotes = useQuotes(blocks);
  if (!quotes.length) return <EditorHint context={context} text="Add customer quotes to this section." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} />
      <Scroller label={settings.heading || 'Testimonials'} itemClassName="w-[85%] @2xl:w-[48%] @5xl:w-[32%]" items={quotes.map(({ settings: q }) => <QuoteCard q={q} />)} />
    </div>
  );
}
