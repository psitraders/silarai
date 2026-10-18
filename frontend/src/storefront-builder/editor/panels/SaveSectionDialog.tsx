import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { apiErrorMessage } from '../api';
import { editorPacks } from '../packs';
import { useSavedSectionMutations } from '../state/savedSections';
import { useEditor } from '../state/store';
import { FieldLabel, INPUT } from '../ui/controls';
import { useToast } from '../ui/toastStore';

/** "Save for reuse": names a section of the current page and keeps it in the gallery's Saved group. */
export function SaveSectionDialog() {
  const section = useEditor(s => s.savingSection);
  const close = useEditor(s => s.openSaveSection);
  if (!section) return null;
  // Keyed so the name resets for every section.
  return <SaveSectionForm key={section.id} onClose={() => close(null)} />;
}

function SaveSectionForm({ onClose }: { onClose: () => void }) {
  const section = useEditor(s => s.savingSection)!;
  const packName = editorPacks.get('section', section.type)?.name ?? 'Section';
  const [name, setName] = useState(packName);
  const [error, setError] = useState<string | null>(null);
  const { save } = useSavedSectionMutations();
  const show = useToast(s => s.show);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Give the section a name.'); return; }
    // A hidden section is still saved visible — it is hidden on this page only.
    const copy = { ...section };
    delete copy.hidden;
    save.mutate({ name: trimmed, section: copy }, {
      onSuccess: () => { show('success', `Saved “${trimmed}”. Find it under Saved in Add section.`); onClose(); },
      onError: err => setError(apiErrorMessage(err)),
    });
  };

  return (
    <Modal open onClose={onClose} title="Save section for reuse" size="sm">
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); submit(); }}>
        <div>
          <FieldLabel htmlFor="sb-save-section-name" helper="Saved sections can be added to any page. Products and prices stay live.">Name</FieldLabel>
          <input id="sb-save-section-name" autoFocus maxLength={100} value={name} onChange={e => setName(e.target.value)} className={INPUT} />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-10 cursor-pointer rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={save.isPending} className="theme-btn min-h-10 cursor-pointer rounded-xl px-5 text-sm font-semibold disabled:opacity-60">{save.isPending ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
