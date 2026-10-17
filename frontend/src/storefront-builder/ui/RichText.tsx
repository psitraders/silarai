import { useEffect, useState } from 'react';
import { sanitizeHtml } from '../core/sanitize';

/**
 * Renders merchant rich text. The server already sanitised it on save (SB-R4);
 * DOMPurify runs again in the browser before it is ever placed in the DOM.
 */
export function RichText({ html, wide = false, className = '' }: { html: string; wide?: boolean; className?: string }) {
  const [result, setResult] = useState<{ source: string; clean: string } | null>(null);

  useEffect(() => {
    if (!html) return;
    let alive = true;
    sanitizeHtml(html).then(clean => { if (alive) setResult({ source: html, clean }); });
    return () => { alive = false; };
  }, [html]);

  if (!html) return null;
  // While a new version is being cleaned (e.g. typing in the editor), keep showing the last clean one.
  if (!result) return <div className="sf-skeleton h-24 rounded-lg" aria-hidden />;
  // Sanitised twice: on save by the server and here by DOMPurify.
  return <div className={`sf-prose ${wide ? 'sf-prose-wide' : ''} ${className}`} dangerouslySetInnerHTML={{ __html: result.clean }} />;
}
