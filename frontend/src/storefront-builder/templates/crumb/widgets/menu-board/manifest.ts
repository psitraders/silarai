import type { PackManifest, SmartCategories } from '../../../../core/types';

export interface MenuBoardSettings {
  eyebrow: string;
  heading: string;
  /** One menu column per category. */
  categories: SmartCategories;
  perCategory: number;
}

/** Crumb signature widget: a café-style menu with dotted price leaders (prices live from the catalogue). */
const manifest: PackManifest<MenuBoardSettings> = {
  kind: 'section',
  id: 'menu-board',
  name: 'Menu board',
  version: 1,
  tier: 'free',
  template: 'crumb',
  defaults: { eyebrow: 'Our menu', heading: 'Baked fresh', categories: { $categories: { source: 'all', limit: 6 } }, perCategory: 8 },
  defaultLayout: 'board',
  layouts: {
    board: { name: 'Menu board', load: () => import('./layouts/Board') },
  },
};

export default manifest;
