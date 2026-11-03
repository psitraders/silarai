import React from 'react';
import { findSeoMetaEntry, SeoMetaRow } from '../data/seoMetaTable';

interface SectionSeoMetaSnippetProps {
  currentView: string;
  subPage?: number;
  sectorSlug?: string;
  useCaseSlug?: string;
}

export const SectionSeoMetaSnippet: React.FC<SectionSeoMetaSnippetProps> = ({
  currentView,
  subPage,
  sectorSlug,
  useCaseSlug,
}) => {
  const entry: SeoMetaRow = findSeoMetaEntry(currentView, subPage, sectorSlug, useCaseSlug);

  // Semantic DOM metadata preserved for machine reading and structured inspection

  // Hidden from visual website view while preserving embedded SEO metadata & JSON-LD for crawlers and backend
  return (
    <aside
      id={`section-seo-meta-banner-${entry.id}`}
      aria-label="SEO Meta & Google SERP Details"
      aria-hidden="true"
      className="hidden"
      style={{ display: 'none' }}
    >
      <div
        style={{ display: 'none' }}
        className="hidden"
        aria-hidden="true"
      >
        <meta itemProp="name" content={entry.seoTitle} />
        <meta itemProp="headline" content={entry.section} />
        <meta itemProp="description" content={entry.metaDescription} />
        <meta itemProp="keywords" content={entry.primaryKeywords.join(', ')} />
        <link itemProp="url" href={entry.canonicalUrl} />
      </div>
    </aside>
  );
};
