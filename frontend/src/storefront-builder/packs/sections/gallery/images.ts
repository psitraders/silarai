import { blocksOf } from '../../../core/blocks';
import type { BlockInstance } from '../../../core/types';
import { IMAGE_DEFAULTS } from './manifest';

export const useImages = (blocks: BlockInstance[]) => blocksOf(blocks, 'image', IMAGE_DEFAULTS);

export const COLS = { '2': '@3xl:grid-cols-2', '3': '@3xl:grid-cols-3', '4': '@3xl:grid-cols-4' } as const;
