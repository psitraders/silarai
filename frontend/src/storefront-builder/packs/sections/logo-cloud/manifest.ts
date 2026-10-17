import type { PackManifest, SmartImage, SmartLink } from '../../../core/types';

export interface LogoCloudSettings { heading: string; grayscale: boolean }
export interface LogoBlock { image: SmartImage; name: string; link: SmartLink }
export const LOGO_DEFAULTS: LogoBlock = { image: { $image: '' }, name: 'Brand', link: { $link: '' } };

const manifest: PackManifest<LogoCloudSettings> = {
  kind: 'section',
  id: 'logo-cloud',
  name: 'Logos',
  version: 1,
  tier: 'free',
  defaults: { heading: 'As seen in', grayscale: true },
  defaultLayout: 'row',
  layouts: {
    row: { name: 'Row', load: () => import('./layouts/Row') },
    marquee: { name: 'Moving strip', load: () => import('./layouts/Marquee') },
  },
};

export default manifest;
