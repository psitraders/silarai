import { blocksOf } from '../../../core/blocks';
import type { BlockInstance } from '../../../core/types';
import { QUOTE_DEFAULTS } from './manifest';

export const useQuotes = (blocks: BlockInstance[]) =>
  blocksOf(blocks, 'quote', QUOTE_DEFAULTS).filter(q => q.settings.quote.trim());
