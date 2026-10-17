import type { PackEditorMeta } from '../../../core/types';

/** Editor-only metadata (loaded by the editor and dev gallery, never by shoppers). */
const meta: PackEditorMeta = {
  description: 'Logo, menu, search, cart and account. Shared by every page.',
  fields: [
    { key: 'announcements', label: 'Announcement messages', type: 'list', helper: 'Shown in a strip above the header. Leave empty to hide it.', group: 'Announcement' },
    {
      key: 'announcementStyle', label: 'Announcement style', type: 'select', group: 'Announcement',
      options: [{ value: 'static', label: 'Static (first message)' }, { value: 'rotating', label: 'Rotating' }, { value: 'marquee', label: 'Moving' }],
    },
    { key: 'announcementLink', label: 'Announcement link', type: 'link', group: 'Announcement' },
    { key: 'utilityText', label: 'Utility bar text', type: 'text', helper: 'Two-tier layout only, e.g. "Call us: +91 98765 43210".', group: 'Announcement' },
    {
      key: 'sticky', label: 'When scrolling', type: 'select', group: 'Behaviour',
      options: [{ value: 'always', label: 'Always visible' }, { value: 'scroll-up', label: 'Hide, show on scroll up' }, { value: 'off', label: 'Scrolls away' }],
    },
    {
      key: 'search', label: 'Search', type: 'select', group: 'Behaviour',
      options: [{ value: 'icon', label: 'Icon (opens a bar)' }, { value: 'bar', label: 'Always-visible bar (wide screens)' }, { value: 'off', label: 'Hidden' }],
    },
    {
      key: 'mobileMenu', label: 'Mobile menu', type: 'select', group: 'Behaviour',
      options: [{ value: 'drawer-left', label: 'Drawer from left' }, { value: 'drawer-right', label: 'Drawer from right' }, { value: 'fullscreen', label: 'Full screen' }],
    },
    { key: 'featuredCategoriesInMenu', label: 'Featured categories in the default menu', type: 'toggle', helper: 'Ignored once you build your own menu in Navigation.', group: 'Behaviour' },
    { key: 'logoSize', label: 'Logo size', type: 'select', group: 'Look', options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }] },
    { key: 'cartIcon', label: 'Cart icon', type: 'select', group: 'Look', options: [{ value: 'bag', label: 'Bag' }, { value: 'cart', label: 'Trolley' }, { value: 'basket', label: 'Basket' }] },
    { key: 'showAccount', label: 'Show account button', type: 'toggle', group: 'Look' },
    { key: 'showWhatsApp', label: 'Show WhatsApp chat button', type: 'toggle', group: 'Look' },
  ],
  layouts: {
    classic: { description: 'Logo left · menu centre · icons right', thumb: [[0, 22, 100, 20, 'm'], [4, 28, 14, 8, 'h'], [32, 30, 10, 4, 't'], [45, 30, 10, 4, 't'], [58, 30, 10, 4, 't'], [80, 29, 6, 6, 'b'], [89, 29, 6, 6, 'b']] },
    'logo-left-menu-right': { description: 'Logo left · menu and icons right', thumb: [[0, 22, 100, 20, 'm'], [4, 28, 14, 8, 'h'], [46, 30, 9, 4, 't'], [57, 30, 9, 4, 't'], [68, 30, 9, 4, 't'], [82, 29, 6, 6, 'b'], [90, 29, 6, 6, 'b']] },
    'centered-logo': { description: 'Menu left · logo centre · icons right', thumb: [[0, 22, 100, 20, 'm'], [4, 30, 9, 4, 't'], [15, 30, 9, 4, 't'], [26, 30, 9, 4, 't'], [42, 28, 16, 8, 'h'], [80, 29, 6, 6, 'b'], [89, 29, 6, 6, 'b']] },
    'stacked-centered': { description: 'Logo centred on top, menu centred below', thumb: [[0, 14, 100, 36, 'm'], [40, 18, 20, 10, 'h'], [24, 36, 10, 4, 't'], [37, 36, 10, 4, 't'], [50, 36, 10, 4, 't'], [63, 36, 10, 4, 't'], [88, 20, 6, 6, 'b']] },
    'split-menu': { description: 'Menu on both sides of a centred logo', thumb: [[0, 22, 100, 20, 'm'], [6, 30, 9, 4, 't'], [18, 30, 9, 4, 't'], [42, 28, 16, 8, 'h'], [62, 30, 9, 4, 't'], [74, 30, 9, 4, 't'], [89, 29, 6, 6, 'b']] },
    'minimal-drawer': { description: 'Logo, menu button and cart — everything else in a drawer', thumb: [[0, 22, 100, 20, 'm'], [4, 29, 6, 6, 'b'], [42, 28, 16, 8, 'h'], [89, 29, 6, 6, 'b']] },
    'search-first': { description: 'Big search bar in the middle', thumb: [[0, 22, 100, 20, 'm'], [4, 28, 14, 8, 'h'], [24, 27, 50, 10, 'c'], [80, 29, 6, 6, 'b'], [89, 29, 6, 6, 'b']] },
    'two-tier': { description: 'Utility bar (phone, delivery info) above the main bar', thumb: [[0, 14, 100, 8, 'h'], [0, 22, 100, 22, 'm'], [4, 29, 14, 8, 'h'], [32, 31, 10, 4, 't'], [45, 31, 10, 4, 't'], [80, 30, 6, 6, 'b'], [89, 30, 6, 6, 'b']] },
    'mega-menu': { description: 'Full-width dropdowns with category photos', thumb: [[0, 6, 100, 14, 'm'], [4, 9, 12, 8, 'h'], [30, 11, 10, 4, 't'], [43, 11, 10, 4, 't'], [0, 20, 100, 38, 'c'], [6, 26, 18, 14, 'i'], [28, 26, 18, 14, 'i'], [52, 26, 14, 3, 't'], [52, 32, 14, 3, 't'], [72, 26, 14, 3, 't'], [72, 32, 14, 3, 't']] },
    'category-rail': { description: 'Main bar with a row of category chips', thumb: [[0, 14, 100, 20, 'm'], [4, 20, 14, 8, 'h'], [80, 21, 6, 6, 'b'], [89, 21, 6, 6, 'b'], [4, 38, 14, 6, 'c'], [21, 38, 14, 6, 'c'], [38, 38, 14, 6, 'c'], [55, 38, 14, 6, 'c'], [72, 38, 14, 6, 'c']] },
    transparent: { description: 'Sits over your first section, turns solid on scroll', thumb: [[0, 0, 100, 64, 'i'], [4, 6, 14, 7, 'h'], [36, 8, 9, 3, 't'], [48, 8, 9, 3, 't'], [60, 8, 9, 3, 't'], [86, 7, 5, 5, 'b'], [93, 7, 5, 5, 'b']] },
    sidebar: { description: 'Fixed menu column on the left (desktop), top bar on phones', thumb: [[0, 0, 24, 64, 'm'], [4, 6, 16, 6, 'h'], [4, 20, 14, 3, 't'], [4, 26, 12, 3, 't'], [4, 32, 14, 3, 't'], [4, 52, 6, 6, 'b'], [30, 6, 64, 52, 'c']] },
    'floating-pill': { description: 'Rounded floating bar with a margin', thumb: [[6, 16, 88, 16, 'c'], [10, 20, 12, 8, 'h'], [36, 22, 9, 4, 't'], [48, 22, 9, 4, 't'], [60, 22, 9, 4, 't'], [82, 21, 6, 6, 'b']] },
  },
};

export default meta;
