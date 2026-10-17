import { buildStarter } from '../../core/templates';
import type { PageLayout, SiteDoc, StoreInfo } from '../../core/types';

export interface StarterDocs { site: SiteDoc; home: PageLayout; collection: PageLayout; product: PageLayout }

/** The built-in Starter design (SB-R5) — the editor's starting point when nothing is saved yet. */
export function starterFor(store: StoreInfo): StarterDocs {
  const built = buildStarter(store);
  return {
    site: built.site,
    home: built.home,
    collection: built.collection ?? { schemaVersion: 1, sections: [] },
    product: built.product ?? { schemaVersion: 1, sections: [] },
  };
}

export const EMPTY_LAYOUT: PageLayout = { schemaVersion: 1, sections: [] };
