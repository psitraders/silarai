/** Zero-decimal currencies — no fractional units */
const ZERO_DECIMAL = new Set([
  'BIF','CLP','DJF','GNF','ISK','JPY','KMF','KRW',
  'MGA','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF',
]);

/** Three-decimal currencies */
const THREE_DECIMAL = new Set(['BHD','IQD','JOD','KWD','LYD','OMR','TND']);

/**
 * Formats a decimal amount as a localised currency string.
 * Uses the browser's locale for number formatting (decimal separators, etc.)
 * and the Intl.NumberFormat currency symbol for the given ISO 4217 code.
 */
export function formatCurrency(amount: number, currency = 'INR'): string {
  const upper = currency.toUpperCase();
  const fractionDigits = ZERO_DECIMAL.has(upper) ? 0
    : THREE_DECIMAL.has(upper) ? 3 : 2;

  return new Intl.NumberFormat(undefined, {   // undefined = browser locale
    style: 'currency',
    currency: upper,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

/**
 * Compact number formatter — uses Intl for locale-aware abbreviations
 * (1.2K, 1.2M, 1.2B) rather than India-only L/Cr abbreviations.
 */
export function formatNumber(n: number): string {
  if (n === 0) return '0';
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}
