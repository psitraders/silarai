import { blocksOf } from '../../../core/blocks';
import type { BlockInstance } from '../../../core/types';
import { LOGO_DEFAULTS } from './manifest';

export const useLogos = (blocks: BlockInstance[]) => blocksOf(blocks, 'logo', LOGO_DEFAULTS);
