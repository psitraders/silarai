/**
 * The ONE place that decides whether a template / pack / option may be used (SB-R13).
 * Everything is free for now (decision D3). When paid tiers are introduced, wire this
 * to the tenant's subscription plan — no layout or pack code needs to change.
 */
export function canUse(item: { tier?: 'free' | 'premium' }): boolean {
  void item;
  return true;
}
