import { useCategories } from '../../../core/data/hooks';
import { useLinkReader, useStorefront } from '../../../core/storefront-context';
import type { MenuItem } from '../../../core/types';

export interface HeaderMenuItem {
  id: string;
  label: string;
  href: string;
  /** Photo for mega-menu columns (categories). */
  image?: string | null;
  children?: HeaderMenuItem[];
}

const MAX_DEPTH = 3;

function fromMenu(items: MenuItem[], readStoreLink: (v: unknown) => string | undefined, depth = 1): HeaderMenuItem[] {
  return items.map(m => ({
    id: m.id,
    label: m.label,
    href: readStoreLink(m.link) ?? '#',
    children: depth < MAX_DEPTH && m.children?.length ? fromMenu(m.children, readStoreLink, depth + 1) : undefined,
  }));
}

/**
 * The main menu: the merchant's own menu (Navigation editor, up to 3 levels),
 * otherwise Home · All products · featured categories · pages marked "show in menu".
 */
export function useMainMenu(includeFeaturedCategories: boolean): HeaderMenuItem[] {
  const { site, navPages, links } = useStorefront();
  const readStoreLink = useLinkReader();
  const { data: categories = [] } = useCategories();

  if (site.menus.main.length) return fromMenu(site.menus.main, readStoreLink);

  const items: HeaderMenuItem[] = [
    { id: 'home', label: 'Home', href: links.home() },
    { id: 'all', label: 'All products', href: links.allProducts() },
  ];
  if (includeFeaturedCategories) {
    for (const c of categories.filter(x => x.isFeatured)) {
      items.push({
        id: `cat-${c.id}`,
        label: c.name,
        href: links.category(c.name),
        image: c.imageUrl,
        children: c.subCategories?.length
          ? [{ id: `cat-${c.id}-all`, label: `All ${c.name}`, href: links.category(c.name) },
             ...c.subCategories.map(s => ({ id: `sub-${s.id}`, label: s.name, href: links.category(c.name, s.name), image: s.imageUrl }))]
          : undefined,
      });
    }
  }
  for (const p of navPages.filter(x => x.showInNav)) {
    items.push({ id: `page-${p.id}`, label: p.title, href: links.page(p.slug) });
  }
  return items;
}

/** All categories as menu items (mega menu and category rail). */
export function useCategoryMenu(): HeaderMenuItem[] {
  const { links } = useStorefront();
  const { data: categories = [] } = useCategories();
  return categories.map(c => ({
    id: `cat-${c.id}`,
    label: c.name,
    href: links.category(c.name),
    image: c.imageUrl,
    children: c.subCategories?.map(s => ({ id: `sub-${s.id}`, label: s.name, href: links.category(c.name, s.name), image: s.imageUrl })),
  }));
}
