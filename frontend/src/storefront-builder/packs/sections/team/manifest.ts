import type { PackManifest } from '../../../core/types';

export interface TeamSettings { eyebrow: string; heading: string; subtitle: string }
export interface MemberBlock { name: string; role: string; bio: string; photo: unknown }

export const MEMBER_DEFAULTS: MemberBlock = { name: 'Your name', role: 'Founder', bio: '', photo: { $image: '' } };

/** The people behind the store — a team grid or a founder story. */
const manifest: PackManifest<TeamSettings> = {
  kind: 'section',
  id: 'team',
  name: 'Team / founder',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: '', heading: 'Meet the team', subtitle: '' },
  defaultLayout: 'cards',
  layouts: {
    cards: { name: 'Cards', load: () => import('./layouts/Cards') },
    split: { name: 'Founder split', load: () => import('./layouts/Split') },
  },
};

export default manifest;
