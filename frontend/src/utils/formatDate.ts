/**
 * Date formatting utilities.
 *
 * ROOT CAUSE FIX: The backend returns DateTime strings without a trailing 'Z'
 * (e.g. "2026-05-15T14:30:00" instead of "2026-05-15T14:30:00Z").
 * Without 'Z', browsers treat the string as *local* time instead of UTC,
 * which causes a systematic offset equal to the user's UTC offset
 * (e.g. India IST = UTC+5:30 → every timestamp appears 5.5 h in the past,
 * which rounds to "6 hours ago" for a note that was just written).
 *
 * Fix: always append 'Z' if the string has no timezone indicator.
 */

/** IANA timezone per country name (covers all countries in countries.ts) */
const COUNTRY_TIMEZONE: Record<string, string> = {
  // South Asia
  'India':                    'Asia/Kolkata',
  'Pakistan':                 'Asia/Karachi',
  'Bangladesh':               'Asia/Dhaka',
  'Sri Lanka':                'Asia/Colombo',
  'Nepal':                    'Asia/Kathmandu',
  // Middle East
  'Saudi Arabia':             'Asia/Riyadh',
  'United Arab Emirates':     'Asia/Dubai',
  'Qatar':                    'Asia/Qatar',
  'Kuwait':                   'Asia/Kuwait',
  'Bahrain':                  'Asia/Bahrain',
  'Oman':                     'Asia/Muscat',
  'Jordan':                   'Asia/Amman',
  'Egypt':                    'Africa/Cairo',
  'Morocco':                  'Africa/Casablanca',
  'Tunisia':                  'Africa/Tunis',
  // Southeast Asia
  'Singapore':                'Asia/Singapore',
  'Malaysia':                 'Asia/Kuala_Lumpur',
  'Indonesia':                'Asia/Jakarta',
  'Philippines':              'Asia/Manila',
  'Thailand':                 'Asia/Bangkok',
  'Vietnam':                  'Asia/Ho_Chi_Minh',
  // East Asia
  'Japan':                    'Asia/Tokyo',
  'South Korea':              'Asia/Seoul',
  'China':                    'Asia/Shanghai',
  'Hong Kong':                'Asia/Hong_Kong',
  'Taiwan':                   'Asia/Taipei',
  // Africa
  'Nigeria':                  'Africa/Lagos',
  'Kenya':                    'Africa/Nairobi',
  'South Africa':             'Africa/Johannesburg',
  'Ghana':                    'Africa/Accra',
  // Americas
  'United States':            'America/New_York',
  'Canada':                   'America/Toronto',
  'Mexico':                   'America/Mexico_City',
  'Brazil':                   'America/Sao_Paulo',
  'Argentina':                'America/Argentina/Buenos_Aires',
  'Colombia':                 'America/Bogota',
  'Chile':                    'America/Santiago',
  // Europe
  'United Kingdom':           'Europe/London',
  'Germany':                  'Europe/Berlin',
  'France':                   'Europe/Paris',
  'Spain':                    'Europe/Madrid',
  'Italy':                    'Europe/Rome',
  'Netherlands':              'Europe/Amsterdam',
  'Switzerland':              'Europe/Zurich',
  'Sweden':                   'Europe/Stockholm',
  'Norway':                   'Europe/Oslo',
  'Denmark':                  'Europe/Copenhagen',
  'Poland':                   'Europe/Warsaw',
  'Czech Republic':           'Europe/Prague',
  'Hungary':                  'Europe/Budapest',
  'Romania':                  'Europe/Bucharest',
  'Turkey':                   'Europe/Istanbul',
  'Ukraine':                  'Europe/Kiev',
  // Oceania
  'Australia':                'Australia/Sydney',
  'New Zealand':              'Pacific/Auckland',
};

/** Returns the IANA timezone for a country name, or the browser's local timezone as fallback. */
export function getTimezoneForCountry(country: string | undefined): string {
  if (country && COUNTRY_TIMEZONE[country]) return COUNTRY_TIMEZONE[country];
  return Intl.DateTimeFormat().resolvedOptions().timeZone; // browser local
}

/**
 * Ensure the date string is parsed as UTC.
 * Appends 'Z' if the string has no explicit timezone indicator.
 */
function toUTCDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const normalized =
    dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-', 10)
      ? dateStr
      : dateStr + 'Z';
  return new Date(normalized);
}

/**
 * Format a date as "15 May 2026" (date only).
 * Defaults to the browser's local timezone; pass a country name for store-specific timezone.
 */
export function formatDate(dateStr: string, country?: string): string {
  try {
    const date = toUTCDate(dateStr);
    const tz = getTimezoneForCountry(country);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: tz,
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Format a date as "15 May 2026, 8:30 PM" (date + time, no "X hours ago").
 * Defaults to the browser's local timezone; pass a country name for store-specific timezone.
 */
export function formatDateFull(dateStr: string, country?: string): string {
  try {
    const date = toUTCDate(dateStr);
    const tz = getTimezoneForCountry(country);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    }).format(date);
  } catch {
    return dateStr;
  }
}
