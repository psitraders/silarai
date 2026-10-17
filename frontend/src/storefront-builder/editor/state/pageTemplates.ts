import { editorPacks } from '../packs';
import type { PageLayout, SectionPreset } from '../../core/types';
import { sectionFromPreset } from './sectionFactory';

/** Starting points for a new page — built from section presets, so they follow every theme. */
export const PAGE_TEMPLATES: { id: string; name: string; description: string; sections: [string, string?][] }[] = [
  { id: 'blank', name: 'Blank page', description: 'Start empty and add any sections.', sections: [] },
  { id: 'about', name: 'About us', description: 'Your story, what you stand for, customer love.', sections: [['rich-text', 'story'], ['image-with-text', 'story'], ['features', 'why-us'], ['testimonials', 'reviews']] },
  { id: 'faq', name: 'FAQ', description: 'Delivery, returns and payment questions.', sections: [['faq', 'delivery'], ['whatsapp-cta', 'help']] },
  { id: 'contact', name: 'Contact', description: 'How to reach you, hours and a map.', sections: [['contact-info', 'contact'], ['map'], ['whatsapp-cta', 'help']] },
  { id: 'policy', name: 'Policy page', description: 'Shipping, returns or terms text.', sections: [['rich-text', 'policy']] },
  { id: 'landing', name: 'Sale landing page', description: 'Countdown, offer banner and products on sale.', sections: [['countdown', 'sale'], ['product-collection', 'on-sale'], ['cta-banner', 'free-delivery']] },
];

export function layoutFromTemplate(templateId: string): PageLayout {
  const tpl = PAGE_TEMPLATES.find(t => t.id === templateId) ?? PAGE_TEMPLATES[0];
  const sections = tpl.sections.flatMap(([type, presetId]) => {
    const m = editorPacks.get('section', type);
    if (!m) return [];
    const preset: SectionPreset | undefined = presetId ? m.presets?.find(p => p.id === presetId) : undefined;
    return [sectionFromPreset(m, preset)];
  });
  return { schemaVersion: 1, sections };
}
