/** Ids the backend accepts: 1–40 of [A-Za-z0-9_-]. */
export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix.replace(/[^a-z0-9-]/gi, '').slice(0, 28)}-${rand}`;
}

export const clone = <T,>(value: T): T => structuredClone(value);
