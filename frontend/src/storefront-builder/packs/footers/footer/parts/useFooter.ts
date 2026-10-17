import { useCategories } from '../../../../core/data/hooks';
import { useShell } from '../../../../core/shell-context';
import { useLinkReader, useStorefront } from '../../../../core/storefront-context';
import type { FooterSettings } from '../manifest';

export interface FooterLink { id: string; label: string; href?: string; onClick?: () => void }
export interface FooterColumn { id: string; title: string; links: FooterLink[] }

/**
 * Footer link columns: the merchant's footer menu (each top-level item is a
 * column, its children are links; loose items form a "Links" column), or a
 * sensible default — Shop · Help.
 */
export function useFooterColumns(settings: FooterSettings): FooterColumn[] {
  const readStoreLink = useLinkReader();
  const { site, navPages, links } = useStorefront();
  const shell = useShell();
  const { data: categories = [] } = useCategories();
  const policy: FooterLink[] = settings.showReturnPolicy ? [{ id: 'policy', label: 'Return policy', onClick: shell.openReturnPolicy }] : [];

  if (site.menus.footer.length) {
    const columns: FooterColumn[] = [];
    const loose: FooterLink[] = [];
    for (const item of site.menus.footer) {
      if (item.children?.length) {
        columns.push({ id: item.id, title: item.label, links: item.children.map(c => ({ id: c.id, label: c.label, href: readStoreLink(c.link) ?? '#' })) });
      } else {
        loose.push({ id: item.id, label: item.label, href: readStoreLink(item.link) ?? '#' });
      }
    }
    if (loose.length || policy.length) columns.push({ id: 'links', title: 'Links', links: [...loose, ...policy] });
    return columns;
  }

  return [
    {
      id: 'shop',
      title: 'Shop',
      links: [
        { id: 'all', label: 'All products', href: links.allProducts() },
        ...(settings.showCategories ? categories.slice(0, 6).map(c => ({ id: c.id, label: c.name, href: links.category(c.name) })) : []),
      ],
    },
    {
      id: 'help',
      title: 'Help',
      links: [...navPages.filter(p => p.showInFooter).map(p => ({ id: p.id, label: p.title, href: links.page(p.slug) })), ...policy],
    },
  ].filter(c => c.links.length);
}

export function useAbout(settings: FooterSettings) {
  const { store } = useStorefront();
  return settings.about.trim() || store.description || '';
}
