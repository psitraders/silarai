/**
 * Template helpers shared by the store shell, the editor and the dev gallery.
 * Templates are code packs (plan D2); their documents load on demand.
 */
import { registry } from './registry';
import type { StoreInfo, TemplateBuild, TemplateDocs, TemplateManifest } from './types';

/** The built-in Starter design (SB-R5) — always available synchronously. */
export function buildStarter(store: StoreInfo): TemplateDocs {
  const starter = registry.getTemplate('starter');
  if (!starter?.build) throw new Error('Starter template pack is missing');
  return starter.build(store);
}

const builds = new Map<string, Promise<TemplateBuild>>();

/** Loads a template's build function (cached per template). */
export function loadTemplateBuild(template: TemplateManifest): Promise<TemplateBuild> {
  if (template.build) return Promise.resolve(template.build);
  if (!template.load) return Promise.reject(new Error(`Template "${template.id}" has nothing to build`));
  let pending = builds.get(template.id);
  if (!pending) {
    pending = template.load().then(m => m.default);
    pending.catch(() => builds.delete(template.id));
    builds.set(template.id, pending);
  }
  return pending;
}

/** Store images allowed in `$image` values (Cloudinary or this API's uploads, as the server checks). */
export function uploadedImage(url: string | null | undefined, apiBase: string | undefined = import.meta.env.VITE_API_URL): string {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return url;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    if (u.hostname.toLowerCase() === 'res.cloudinary.com') return url;
    if (apiBase) {
      const api = new URL(apiBase, typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
      if (u.host.toLowerCase() === api.host.toLowerCase() && u.pathname.startsWith('/uploads/')) return url;
    }
  } catch { /* not a URL */ }
  return '';
}
