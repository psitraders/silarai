import { blocksOf } from '../../../core/blocks';
import type { BlockInstance } from '../../../core/types';
import { FEATURE_DEFAULTS, type FeatureBlock } from './manifest';

export const useFeatures = (blocks: BlockInstance[]): { id: string; settings: FeatureBlock }[] => blocksOf(blocks, 'feature', FEATURE_DEFAULTS);
