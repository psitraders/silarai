import { ArrowDown, ArrowUp, ChevronDown, IndentDecrease, IndentIncrease, Plus, RotateCcw, Trash2, Wand2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { slugify } from '../../core/storefront-context';
import type { MenuItem, SmartLink } from '../../core/types';
import { LinkField } from '../fields/LinkField';
import { useEditorCategories } from '../fields/useStoreData';
import { clone, newId } from '../state/ids';
import { useEditor } from '../state/store';
import { usePagesQuery } from '../state/useEditorBoot';
import { FieldLabel, IconButton, INPUT, Segmented } from '../ui/controls';
import { SortableList } from '../ui/SortableList';

type MenuKey = 'main' | 'footer';
const ROW_BTN = 'inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40';
const MAX_DEPTH: Record<MenuKey, number> = { main: 3, footer: 2 };

/** Path of indexes from the menu root to an item. */
type Path = number[];

function listAt(items: MenuItem[], parent: Path): MenuItem[] {
  let list = items;
  for (const i of parent) list = (list[i].children ??= []);
  return list;
}

/** Navigation editor: main menu (3 levels, mega menus) and footer menu (columns → links). */
export function MenusPanel() {
  const [menu, setMenu] = useState<MenuKey>('main');
  const items = useEditor(s => s.site?.menus[menu] ?? []);
  const updateSite = useEditor(s => s.updateSite);
  const automatic = useAutomaticMenu(menu);
  const edit = (fn: (list: MenuItem[]) => void) => updateSite(s => { fn(s.menus[menu]); });

  return (
    <div className="space-y-4 p-4">
      <Segmented<MenuKey> label="Menu" value={menu} onChange={setMenu} options={[{ value: 'main', label: 'Main menu' }, { value: 'footer', label: 'Footer menu' }]} />

      {items.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-900">Automatic menu</p>
          <p className="text-sm text-slate-600">
            {menu === 'main'
              ? 'Home, All products, your featured categories and pages set to "Show in the main menu" — updated automatically.'
              : 'A "Shop" column with your categories and a "Help" column with pages set to "Show in the footer".'}
          </p>
          <button type="button" onClick={() => updateSite(s => { s.menus[menu] = automatic(); })} className="theme-btn inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold">
            <Wand2 className="h-4 w-4" aria-hidden /> Customise this menu
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">
            {menu === 'main' ? 'Drag or use the arrows to reorder. Indent an item to put it in a dropdown (up to 3 levels).' : 'Top-level items become column headings; indented items are the links in each column.'}
          </p>
          <MenuLevel menu={menu} items={items} parent={[]} depth={1} edit={edit} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => edit(list => { list.push({ id: newId('menu'), label: menu === 'footer' ? 'New column' : 'New link', link: { $link: '/' } }); })} className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 text-sm font-medium theme-text hover:bg-slate-50">
              <Plus className="h-4 w-4" aria-hidden /> {menu === 'footer' ? 'Add column' : 'Add menu item'}
            </button>
            <button type="button" onClick={() => updateSite(s => { s.menus[menu] = []; })} className="ml-auto inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-sm text-slate-600 hover:bg-slate-100">
              <RotateCcw className="h-4 w-4" aria-hidden /> Back to automatic
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MenuLevel({ menu, items, parent, depth, edit }: {
  menu: MenuKey;
  items: MenuItem[];
  parent: Path;
  depth: number;
  edit: (fn: (list: MenuItem[]) => void) => void;
}) {
  const max = MAX_DEPTH[menu];
  const onMove = (id: string, to: number) => edit(root => {
    const list = listAt(root, parent);
    const from = list.findIndex(x => x.id === id);
    if (from < 0) return;
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
  });

  return (
    <div className={depth > 1 ? 'ml-4 border-l-2 border-slate-100 pl-2' : ''}>
      <SortableList
        items={items}
        label={depth === 1 ? 'Menu items' : 'Sub-items'}
        onMove={onMove}
        renderItem={(item, i, handle) => (
          <MenuRow key={item.id} menu={menu} item={item} path={[...parent, i]} index={i} count={items.length} depth={depth} max={max} handle={handle} edit={edit} />
        )}
      />
    </div>
  );
}

function MenuRow({ menu, item, path, index, count, depth, max, handle, edit }: {
  menu: MenuKey;
  item: MenuItem;
  path: Path;
  index: number;
  count: number;
  depth: number;
  max: number;
  handle: ReactNode;
  edit: (fn: (list: MenuItem[]) => void) => void;
}) {
  const [open, setOpen] = useState(false);
  const parent = path.slice(0, -1);
  const childCount = item.children?.length ?? 0;
  const subtreeDepth = (m: MenuItem): number => 1 + Math.max(0, ...(m.children ?? []).map(subtreeDepth));

  const move = (d: number) => edit(root => { const list = listAt(root, parent); const [x] = list.splice(index, 1); list.splice(index + d, 0, x); });
  const remove = () => edit(root => { listAt(root, parent).splice(index, 1); });
  const update = (patch: Partial<MenuItem>) => edit(root => { Object.assign(listAt(root, parent)[index], patch); });
  // Indent: becomes the last child of the previous sibling.
  const indent = () => edit(root => {
    const list = listAt(root, parent);
    const [x] = list.splice(index, 1);
    (list[index - 1].children ??= []).push(x);
  });
  // Outdent: moves out of its parent, right after it.
  const outdent = () => edit(root => {
    const list = listAt(root, parent);
    const [x] = list.splice(index, 1);
    const grand = listAt(root, parent.slice(0, -1));
    grand.splice(parent[parent.length - 1] + 1, 0, x);
    if (!list.length) delete listAt(root, parent.slice(0, -1))[parent[parent.length - 1]].children;
  });
  const canIndent = index > 0 && depth - 1 + subtreeDepth(item) < max;

  return (
    <div>
      <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white py-1 pr-1">
        {handle}
        <button type="button" aria-expanded={open} onClick={() => setOpen(o => !o)} className="flex min-h-8 min-w-0 flex-1 cursor-pointer items-center gap-1 text-left text-sm text-slate-900">
          <span className="truncate font-medium">{item.label || 'Untitled'}</span>
          {childCount > 0 && <span className="shrink-0 text-xs text-slate-400">· {childCount}</span>}
          <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        <IconButton label="Move up" disabled={index === 0} onClick={() => move(-1)}><ArrowUp className="h-4 w-4" aria-hidden /></IconButton>
        <IconButton label="Move down" disabled={index === count - 1} onClick={() => move(1)}><ArrowDown className="h-4 w-4" aria-hidden /></IconButton>
      </div>
      {open && (
        <div className="mt-1 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div>
            <FieldLabel htmlFor={`menu-label-${item.id}`}>Label</FieldLabel>
            <input id={`menu-label-${item.id}`} value={item.label} onChange={e => update({ label: e.target.value })} className={INPUT} />
          </div>
          <LinkField label="Link" value={item.link} onChange={(link: SmartLink) => update({ link })} helper={menu === 'footer' && depth === 1 ? 'Column headings can link somewhere too, or leave "No link".' : undefined} />
          <div className="flex flex-wrap gap-1">
            {depth < max && (
              <button type="button" onClick={() => edit(root => { (listAt(root, parent)[index].children ??= []).push({ id: newId('menu'), label: 'New link', link: { $link: '/' } }); })} className={ROW_BTN}>
                <Plus className="h-4 w-4" aria-hidden /> Add sub-item
              </button>
            )}
            <button type="button" disabled={!canIndent} onClick={indent} className={ROW_BTN} title="Moves this item into the dropdown of the item above">
              <IndentIncrease className="h-4 w-4" aria-hidden /> Indent
            </button>
            <button type="button" disabled={depth === 1} onClick={outdent} className={ROW_BTN}>
              <IndentDecrease className="h-4 w-4" aria-hidden /> Outdent
            </button>
            <button type="button" onClick={remove} className="ml-auto inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" aria-hidden /> Remove
            </button>
          </div>
        </div>
      )}
      {childCount > 0 && <div className="mt-1"><MenuLevel menu={menu} items={item.children!} parent={path} depth={depth + 1} edit={edit} /></div>}
    </div>
  );
}

/** Builds the automatic menu as editable items (the "Customise" starting point). */
function useAutomaticMenu(menu: MenuKey): () => MenuItem[] {
  const { data: categories = [] } = useEditorCategories();
  const { data: pages = [] } = usePagesQuery();
  const link = (href: string): SmartLink => ({ $link: href });
  const custom = pages.filter(p => p.pageType === 'Custom' && p.isPublished);
  return () => clone(menu === 'main'
    ? [
      { id: newId('menu'), label: 'Home', link: link('/') },
      { id: newId('menu'), label: 'All products', link: link('/products') },
      ...categories.filter(c => c.isFeatured).map(c => ({
        id: newId('menu'),
        label: c.name,
        link: link(`/category/${slugify(c.name)}`),
        children: c.subCategories?.length ? c.subCategories.map(s => ({ id: newId('menu'), label: s.name, link: link(`/category/${slugify(c.name)}?sub=${slugify(s.name)}`) })) : undefined,
      })),
      ...custom.filter(p => p.showInNav).map(p => ({ id: newId('menu'), label: p.title, link: link(`/p/${p.slug}`) })),
    ]
    : [
      { id: newId('menu'), label: 'Shop', link: link(''), children: [{ id: newId('menu'), label: 'All products', link: link('/products') }, ...categories.slice(0, 6).map(c => ({ id: newId('menu'), label: c.name, link: link(`/category/${slugify(c.name)}`) }))] },
      ...(custom.some(p => p.showInFooter) ? [{ id: newId('menu'), label: 'Help', link: link(''), children: custom.filter(p => p.showInFooter).map(p => ({ id: newId('menu'), label: p.title, link: link(`/p/${p.slug}`) })) }] : []),
    ]);
}
