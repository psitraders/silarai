import type { PackManifest } from '../../../core/types';

export interface FaqSettings { eyebrow: string; heading: string; subtitle: string }
export interface QuestionBlock { question: string; answer: string }
export const QUESTION_DEFAULTS: QuestionBlock = { question: 'Your question?', answer: 'A short, helpful answer.' };

const manifest: PackManifest<FaqSettings> = {
  kind: 'section',
  id: 'faq',
  name: 'FAQ',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: '', heading: 'Frequently asked questions', subtitle: '' },
  defaultLayout: 'accordion',
  layouts: {
    accordion: { name: 'Accordion', load: () => import('./layouts/Accordion') },
    'two-column': { name: 'Two columns', load: () => import('./layouts/TwoColumn') },
  },
};

export default manifest;
