import { create } from 'zustand';

interface ToastState {
  toast: { id: number; tone: 'success' | 'error'; text: string; action?: { label: string; href: string } } | null;
  show: (tone: 'success' | 'error', text: string, action?: { label: string; href: string }) => void;
  hide: () => void;
}

export const useToast = create<ToastState>(set => ({
  toast: null,
  show: (tone, text, action) => set({ toast: { id: Date.now(), tone, text, action } }),
  hide: () => set({ toast: null }),
}));
