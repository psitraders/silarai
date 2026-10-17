import type { AnnouncementSettings } from './manifest';

export const useMessages = (s: AnnouncementSettings) => (s.messages ?? []).map(m => m.trim()).filter(Boolean);
