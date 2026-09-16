import React from 'react';
import { getInternalLinkingForPage } from '../data/internalLinkingClusters';

interface InternalLinkingSectionProps {
  currentPage: string;
  onNavigate?: (view: string, options?: any) => void;
  className?: string;
  theme?: 'dark' | 'light';
}

export const InternalLinkingSection: React.FC<InternalLinkingSectionProps> = ({
  currentPage,
  onNavigate
}) => {
  const cluster = getInternalLinkingForPage(currentPage);

  // Visually hidden from human visitors to ensure a clean, distraction-free landing page UX,
  // while fully preserved in the backend DOM and schema layer for web crawlers, AI search engines, and screen readers.
  return (
    <section
      id="topical-internal-links-section"
      aria-label="Related Solutions &amp; Topical Architecture"
      className="sr-only"
    >
      <nav aria-label="Topical Internal Link Architecture">
        <h2>Related Solutions &amp; Connected Topical Pages</h2>
        <p>{cluster.description}</p>
        <ul>
          {cluster.links.map((link, idx) => (
            <li key={idx}>
              <a
                href={link.path}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(link.view, link.options);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                title={link.anchorText}
              >
                <span>{link.title}</span> - <span>{link.badge}</span>: <span>{link.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Embedded Schema.org ItemList for Search Engine Bots.
          Absolute URLs use the apex origin: www.silarai.com does not resolve and
          index.html declares https://silarai.com/ as canonical. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Topical Internal Link Cluster for ${cluster.pageTitle}`,
            description: cluster.description,
            numberOfItems: cluster.links.length,
            itemListElement: cluster.links.map((link, idx) => ({
              '@type': 'SiteNavigationElement',
              position: idx + 1,
              name: link.title,
              description: link.description,
              url: `https://silarai.com${link.path}`
            }))
          })
        }}
      />
    </section>
  );
};
