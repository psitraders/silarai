import type { PackManifest, SmartLink } from '../../../core/types';

export interface AnnouncementSettings { messages: string[]; link: SmartLink; size: 'small' | 'regular' }

const manifest: PackManifest<AnnouncementSettings> = {
  kind: 'section',
  id: 'announcement',
  name: 'Announcement strip',
  version: 1,
  tier: 'free',
  defaults: { messages: ['Free delivery on orders above ₹999', 'Cash on delivery available'], link: { $link: '' }, size: 'regular' },
  defaultLayout: 'static',
  layouts: {
    static: { name: 'Static', load: () => import('./layouts/Static') },
    rotating: { name: 'Rotating', load: () => import('./layouts/Rotating') },
    marquee: { name: 'Moving', load: () => import('./layouts/Marquee') },
  },
};

export default manifest;
