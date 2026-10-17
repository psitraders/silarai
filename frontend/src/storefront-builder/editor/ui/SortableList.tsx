/**
 * Drag-to-reorder list (@dnd-kit; editor chunk only). Drags start after 6 px so taps
 * never drag; keyboard sorting via Space + arrows; the drop animation is skipped
 * under reduced motion. Every row must ALSO offer up/down buttons (SB-R9).
 */
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';

const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function SortableList<T extends { id: string }>({ items, onMove, renderItem, label }: {
  items: T[];
  onMove: (id: string, toIndex: number) => void;
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode;
  label: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const to = items.findIndex(i => i.id === over.id);
    if (to >= 0) onMove(String(active.id), to);
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{ screenReaderInstructions: { draggable: `To reorder ${label}, press Space to pick up, use the arrow keys to move, and Space to drop.` } }}
    >
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-1" aria-label={label}>
          {items.map((item, index) => <SortableRow key={item.id} id={item.id}>{handle => renderItem(item, index, handle)}</SortableRow>)}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    transition: reduced() ? null : undefined,
  });
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      className="inline-flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4" aria-hidden />
    </button>
  );
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition: transition ?? undefined }}
      className={`relative ${isDragging ? 'z-10 opacity-80 shadow-lg' : ''}`}
    >
      {children(handle)}
    </li>
  );
}
