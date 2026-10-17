import type { BlockInstance, Settings } from './types';

/** Block settings merged over the block type's defaults (layouts read blocks through this). */
export function blockSettings<T>(defaults: T, block: BlockInstance): T {
  return { ...(defaults as Settings), ...(block.settings ?? {}) } as T;
}

/** Blocks of one type, with their effective settings. */
export function blocksOf<T>(blocks: BlockInstance[], type: string, defaults: T): { id: string; settings: T }[] {
  return blocks.filter(b => b.type === type).map(b => ({ id: b.id, settings: blockSettings(defaults, b) }));
}
