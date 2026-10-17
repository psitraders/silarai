import { CompareTable } from '../../ui/CompareTable';
import { Overlay } from '../../ui/Overlay';

/** The comparison table in a dialog (lazy: only loaded when the shopper compares). */
export default function CompareDialog({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  return (
    <Overlay onClose={onClose} label="Compare products" variant="modal" size="xl">
      <div className="max-h-[85dvh] overflow-y-auto p-4 pt-12 sm:p-6 sm:pt-12">
        <h2 className="sf-h2 mb-4">Compare products</h2>
        <CompareTable ids={ids} />
      </div>
    </Overlay>
  );
}
