/**
 * Parses the browser's User-Agent into a short human-readable string,
 * e.g. "Chrome 124 on Windows 11" or "Safari on iPhone".
 * Used as DeviceInfo when creating refresh-token sessions.
 */
export function getDeviceInfo(): string {
  const ua = navigator.userAgent;

  // ── OS ────────────────────────────────────────────────────────────────────
  let os = 'Unknown OS';
  if (/Windows NT 10\.0/.test(ua))      os = 'Windows 10/11';
  else if (/Windows NT 6\.3/.test(ua))  os = 'Windows 8.1';
  else if (/Windows NT 6\.1/.test(ua))  os = 'Windows 7';
  else if (/Windows/.test(ua))          os = 'Windows';
  else if (/iPhone/.test(ua))           os = 'iPhone';
  else if (/iPad/.test(ua))             os = 'iPad';
  else if (/Android/.test(ua)) {
    const m = ua.match(/Android ([\d.]+)/);
    os = m ? `Android ${m[1]}` : 'Android';
  }
  else if (/Mac OS X/.test(ua)) {
    const m = ua.match(/Mac OS X ([\d_]+)/);
    os = m ? `macOS ${m[1].replace(/_/g, '.')}` : 'macOS';
  }
  else if (/Linux/.test(ua))            os = 'Linux';

  // ── Browser ───────────────────────────────────────────────────────────────
  let browser = 'Unknown Browser';
  // Order matters: Edge/OPR must come before Chrome
  if (/Edg\//.test(ua)) {
    const m = ua.match(/Edg\/([\d]+)/);
    browser = m ? `Edge ${m[1]}` : 'Edge';
  } else if (/OPR\//.test(ua)) {
    const m = ua.match(/OPR\/([\d]+)/);
    browser = m ? `Opera ${m[1]}` : 'Opera';
  } else if (/Chrome\//.test(ua)) {
    const m = ua.match(/Chrome\/([\d]+)/);
    browser = m ? `Chrome ${m[1]}` : 'Chrome';
  } else if (/Firefox\//.test(ua)) {
    const m = ua.match(/Firefox\/([\d]+)/);
    browser = m ? `Firefox ${m[1]}` : 'Firefox';
  } else if (/Safari\//.test(ua)) {
    const m = ua.match(/Version\/([\d]+)/);
    browser = m ? `Safari ${m[1]}` : 'Safari';
  }

  return `${browser} on ${os}`;
}

/**
 * Parses a stored deviceInfo string back into { browser, os } parts.
 * Falls back gracefully if the string doesn't match "X on Y".
 */
export function parseDeviceInfo(raw: string | null): { browser: string; os: string } {
  if (!raw) return { browser: 'Unknown browser', os: 'Unknown device' };
  const idx = raw.indexOf(' on ');
  if (idx === -1) return { browser: raw, os: '' };
  return { browser: raw.slice(0, idx), os: raw.slice(idx + 4) };
}
