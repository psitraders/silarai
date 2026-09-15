import React, { useEffect } from 'react';
import { findSeoMetaEntry, SeoMetaRow } from '../data/seoMetaTable';

interface SectionSeoMetaSnippetProps {
  currentView: string;
  subPage?: number;
  onOpenFullTable?: () => void;
}

export const SectionSeoMetaSnippet: React.FC<SectionSeoMetaSnippetProps> = ({
  currentView,
  subPage,
}) => {
  const entry: SeoMetaRow = findSeoMetaEntry(currentView, subPage);

  // Keep SEO contents dynamically embedded in the website's document head and backend metadata
  useEffect(() => {
    if (!entry) return;

    if (entry.seoTitle) {
      document.title = entry.seoTitle;
    }

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setOgMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (entry.metaDescription) {
      setMeta('description', entry.metaDescription);
      setOgMeta('og:description', entry.metaDescription);
      setMeta('twitter:description', entry.metaDescription);
    }

    if (entry.primaryKeywords && entry.primaryKeywords.length > 0) {
      setMeta('keywords', entry.primaryKeywords.join(', '));
    }

    if (entry.seoTitle) {
      setOgMeta('og:title', entry.seoTitle);
      setMeta('twitter:title', entry.seoTitle);
    }

    if (entry.canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', entry.canonicalUrl);
      setOgMeta('og:url', entry.canonicalUrl);
    }
  }, [entry]);

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
        {/* Embedded Backend SEO Microdata & JSON-LD Schema for Google, LLM & Web Crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': entry.schemaType.includes('SoftwareApplication') ? 'SoftwareApplication' : 'WebPage',
              name: entry.seoTitle,
              headline: entry.section,
              description: entry.metaDescription,
              url: entry.canonicalUrl,
              keywords: entry.primaryKeywords.join(', '),
              inLanguage: 'en-US',
              isPartOf: {
                '@type': 'WebSite',
                name: 'SilarAI Smart Commerce Platform',
                url: 'https://silarai.com/'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: entry.rating,
                reviewCount: entry.reviewCount,
                bestRating: '5',
                worstRating: '1'
              }
            })
          }}
        />
        <meta itemProp="name" content={entry.seoTitle} />
        <meta itemProp="headline" content={entry.section} />
        <meta itemProp="description" content={entry.metaDescription} />
        <meta itemProp="keywords" content={entry.primaryKeywords.join(', ')} />
        <link itemProp="url" href={entry.canonicalUrl} />
      </div>
    </aside>
  );
};
