import { useEffect } from 'react';
import { sidePanelOpen, useEditor } from './store';

/** True when typing in a field, where Ctrl+Z belongs to the field itself. */
function inTextField(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.closest !== 'function') return false;
  return !!el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
}

/**
 * Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z or Ctrl+Y = redo. Ignored inside text fields and while a
 * dialog is open. Used once for the editor document and once for the preview frame's document.
 */
export function useUndoShortcuts(target: Document) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || inTextField(e.target)) return;
      const key = e.key.toLowerCase();
      const redo = (key === 'z' && e.shiftKey) || (key === 'y' && !e.shiftKey && !e.metaKey);
      if (key !== 'z' && !redo) return;
      const s = useEditor.getState();
      if (s.gallery || s.wizard || sidePanelOpen(s) || s.savingSection || document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      if (redo) s.redo(); else s.undo();
    };
    target.addEventListener('keydown', onKey);
    return () => target.removeEventListener('keydown', onKey);
  }, [target]);
}
