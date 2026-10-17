import type { QuickviewProps } from '../../../../core/types';
import type { ImageRatio } from '../../../../ui/product/Gallery';

export const ratioOf = (props: QuickviewProps): ImageRatio => (props.settings.imageRatio as ImageRatio | undefined) ?? 'portrait';
export const zoomOf = (props: QuickviewProps) => props.settings.zoom !== false;
