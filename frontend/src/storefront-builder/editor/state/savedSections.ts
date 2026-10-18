import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { builderApi, type SavedSection } from '../api';

export const SAVED_SECTIONS_KEY = ['sb-saved-sections'] as const;

/** The merchant's saved sections (newest first). Loaded when the gallery opens. */
export function useSavedSections(enabled = true) {
  return useQuery({ queryKey: SAVED_SECTIONS_KEY, queryFn: builderApi.listSavedSections, enabled, staleTime: 60_000 });
}

export function useSavedSectionMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: SAVED_SECTIONS_KEY });
  const save = useMutation({ mutationFn: builderApi.saveSection, onSuccess: refresh });
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => builderApi.renameSavedSection(id, name),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (s: SavedSection) => builderApi.deleteSavedSection(s.id),
    onSuccess: refresh,
  });
  return { save, rename, remove };
}
