/**
 * The live preview: a same-origin iframe with its own React root. The frame gives
 * true viewport widths (phone / tablet / desktop), real `position: fixed` and its own
 * router, so storefront links never navigate the dashboard. Styles from the app
 * (Tailwind, storefront CSS, font links) are mirrored into the frame as they load.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useEditor } from '../state/store';
import { FRAME_CSS } from './frameStyles';
import { PreviewApp } from './PreviewApp';

/** Real widths the preview renders at; narrower editor windows scale the frame down. */
const WIDTH = { desktop: 1280, tablet: 820, mobile: 390 } as const;
const SRC_DOC = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="sb-preview-root"></div></body></html>';

function mirrorStyles(target: Document): () => void {
  const clones = new Map<Node, HTMLElement>();
  const isStyle = (n: Node): n is HTMLElement =>
    n instanceof HTMLElement && (n.tagName === 'STYLE' || (n.tagName === 'LINK' && (n as HTMLLinkElement).rel === 'stylesheet'));
  const sync = () => {
    const current = new Set<Node>(document.head.querySelectorAll('style, link[rel="stylesheet"]'));
    for (const [orig, copy] of clones) {
      if (!current.has(orig)) { copy.remove(); clones.delete(orig); }
    }
    for (const orig of current) {
      if (!isStyle(orig)) continue;
      const existing = clones.get(orig);
      if (existing) {
        // Vite HMR rewrites <style> text in place.
        if (orig.tagName === 'STYLE' && existing.textContent !== orig.textContent) existing.textContent = orig.textContent;
        continue;
      }
      const copy = orig.cloneNode(true) as HTMLElement;
      target.head.appendChild(copy);
      clones.set(orig, copy);
    }
  };
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.head, { childList: true, subtree: true, characterData: true });
  return () => observer.disconnect();
}

/** Size of an element, kept up to date. */
function useSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

export function PreviewFrame() {
  const qc = useQueryClient();
  const device = useEditor(s => s.device);
  const iframe = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { width: availW, height: availH } = useSize(stage);
  const [frameDoc, setFrameDoc] = useState<Document | null>(null);

  // Desktop uses the full stage when it is wider than 1280 px; otherwise the frame keeps its
  // real device width and is scaled down to fit, so layouts look exactly as on that device.
  const phoneEditor = availW > 0 && availW < 500;
  const target = phoneEditor ? availW : device === 'desktop' ? Math.max(WIDTH.desktop, availW) : WIDTH[device];
  const scale = availW > 0 ? Math.min(1, availW / target) : 1;
  // Keep the selection label + toolbar a constant size on screen while the frame is scaled.
  useEffect(() => {
    frameDoc?.documentElement.style.setProperty('--sb-inv', String(scale ? 1 / scale : 1));
  }, [frameDoc, scale]);

  // React root inside the frame (mounted once the frame document exists).
  useEffect(() => {
    if (!frameDoc) return;
    const style = frameDoc.createElement('style');
    style.textContent = FRAME_CSS;
    frameDoc.head.appendChild(style);
    const stopMirror = mirrorStyles(frameDoc);
    const container = frameDoc.getElementById('sb-preview-root');
    let root: Root | null = null;
    if (container) {
      root = createRoot(container);
      root.render(<PreviewApp queryClient={qc} frameDoc={frameDoc} />);
    }
    return () => {
      stopMirror();
      // Unmount after the current render finishes (React forbids sync unmount during render).
      const r = root;
      setTimeout(() => r?.unmount(), 0);
    };
  }, [frameDoc, qc]);

  return (
    <div ref={stage} className="relative h-full w-full overflow-clip bg-slate-100">
      <div
        className="absolute top-0 overflow-clip bg-white md:shadow-lg md:ring-1 md:ring-slate-900/5"
        style={{ width: target * scale, height: availH, left: Math.max(0, (availW - target * scale) / 2) }}
      >
        <iframe
          ref={iframe}
          title="Store preview"
          srcDoc={SRC_DOC}
          className="block border-0"
          style={{ width: target, height: scale ? availH / scale : availH, transform: `scale(${scale})`, transformOrigin: '0 0' }}
          onLoad={() => setFrameDoc(iframe.current?.contentDocument ?? null)}
        />
      </div>
      {scale < 1 && !phoneEditor && (
        <span className="pointer-events-none absolute bottom-2 right-3 rounded-md bg-slate-900/70 px-2 py-1 text-[11px] font-medium text-white">
          {device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet' : 'Phone'} · {Math.round(scale * 100)}%
        </span>
      )}
    </div>
  );
}
