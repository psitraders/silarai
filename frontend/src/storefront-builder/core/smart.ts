/** Readers for smart values stored in settings (see core/types.ts). */
import type { SmartCategories, SmartImage, SmartLink, SmartProducts, SmartRichText } from './types';

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export function readText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function readLink(value: unknown): string | undefined {
  if (isObj(value) && typeof (value as unknown as SmartLink).$link === 'string') {
    const v = (value as unknown as SmartLink).$link.trim();
    return v.length ? v : undefined;
  }
  return undefined;
}

export function readImage(value: unknown): string | undefined {
  if (isObj(value) && typeof (value as unknown as SmartImage).$image === 'string') {
    const v = (value as unknown as SmartImage).$image.trim();
    return v.length ? v : undefined;
  }
  return undefined;
}

export function readRichText(value: unknown): string {
  return isObj(value) && typeof (value as unknown as SmartRichText).$richtext === 'string'
    ? (value as unknown as SmartRichText).$richtext
    : '';
}

export function readProducts(value: unknown): SmartProducts | undefined {
  return isObj(value) && isObj(value.$products) ? (value as unknown as SmartProducts) : undefined;
}

export function readCategories(value: unknown): SmartCategories | undefined {
  return isObj(value) && isObj(value.$categories) ? (value as unknown as SmartCategories) : undefined;
}

export const link = (href: string): SmartLink => ({ $link: href });
export const image = (url: string | undefined | null): SmartImage => ({ $image: url ?? '' });
export const richText = (html: string): SmartRichText => ({ $richtext: html });

/** Is this an absolute external link (opens in a new tab)? */
export const isExternal = (href: string) => /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
