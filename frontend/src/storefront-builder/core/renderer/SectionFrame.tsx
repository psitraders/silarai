import { Component, Suspense, type ReactNode } from 'react';
import type { LayoutProps, PackKind, RenderContext, SectionInstance } from '../types';
import { effectiveSettings, resolvePack } from './lazyLayout';

class SectionErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.error('[storefront-builder] section failed to render', error);
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Placeholder({ text, context }: { text: string; context: RenderContext }) {
  // Shoppers never see broken/unknown sections; the editor and gallery do (SB-R3).
  if (context.mode === 'live') return null;
  return (
    <div className="sf-container py-8">
      <div className="rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm sf-muted" style={{ borderColor: 'var(--sf-border)' }}>
        {text}
      </div>
    </div>
  );
}

const VISIBILITY_CLASS = { all: '', desktop: 'hidden md:block', mobile: 'md:hidden' } as const;

/**
 * Renders one section-like instance (section, header or footer):
 * resolves its pack + layout, merges settings, applies the colour scheme and
 * visibility, and isolates failures so one broken section never breaks a page.
 */
export function SectionFrame({
  instance, kind = 'section', context, minHeight = 120, as = 'section',
}: {
  instance: SectionInstance;
  kind?: Extract<PackKind, 'section' | 'header' | 'footer'>;
  context: RenderContext;
  minHeight?: number;
  as?: 'section' | 'header' | 'footer' | 'div';
}) {
  const pack = resolvePack<Record<string, unknown>, LayoutProps>(kind, instance.type, instance.layout);
  if (!pack) return <Placeholder text={`Unknown ${kind} "${instance.type}"`} context={context} />;

  const settings = effectiveSettings(pack.manifest, instance.settings, instance.v);
  const scheme = instance.scheme ?? 'light';
  const Tag = as;
  const visibility = VISIBILITY_CLASS[instance.visibility ?? 'all'];

  return (
    <Tag
      id={as === 'section' ? `section-${instance.id}` : undefined}
      style={as === 'section' ? { scrollMarginTop: 'var(--sf-header-h, 0px)' } : undefined}
      data-sf-scheme={scheme}
      data-sf-section={instance.type}
      data-sf-layout={pack.layoutId}
      className={`sf-cq sf-scheme ${visibility}`}
      aria-label={as === 'section' ? pack.manifest.name : undefined}
    >
      <SectionErrorBoundary fallback={<Placeholder text={`"${pack.manifest.name}" could not be displayed`} context={context} />}>
        <Suspense fallback={<div className="sf-skeleton" style={{ minHeight }} aria-hidden />}>
          <pack.Component
            section={instance}
            settings={settings}
            blocks={instance.blocks ?? []}
            scheme={scheme}
            context={context}
          />
        </Suspense>
      </SectionErrorBoundary>
    </Tag>
  );
}
