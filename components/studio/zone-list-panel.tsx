"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStudioStore } from "@/store/studio-store";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Type,
  Hash,
  ImageIcon,
  Plus,
  Trash2,
  Copy,
} from "lucide-react";
import type { PersonalizationZone } from "@/lib/schemas";

const TYPE_ICONS = {
  text: Type,
  number: Hash,
  image: ImageIcon,
} as const;

const TYPE_COLORS = {
  text: "text-blue-400",
  number: "text-purple-400",
  image: "text-green-400",
} as const;

export function ZoneListPanel() {
  const zones = useStudioStore((s) => s.zones);
  const selectedZoneId = useStudioStore((s) => s.selectedZoneId);
  const setSelectedZoneId = useStudioStore((s) => s.setSelectedZoneId);
  const reorderZones = useStudioStore((s) => s.reorderZones);
  const addZone = useStudioStore((s) => s.addZone);
  const removeZone = useStudioStore((s) => s.removeZone);
  const duplicateZone = useStudioStore((s) => s.duplicateZone);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = zones.findIndex((z) => z.id === active.id);
    const newIndex = zones.findIndex((z) => z.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderZones(oldIndex, newIndex);
    }
  }

  function handleAddZone() {
    const newZone: PersonalizationZone = {
      id: `zone_${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      type: "text",
      uv: { x: 100, y: 100, width: 200, height: 100 },
    };
    addZone(newZone);
    setSelectedZoneId(newZone.id);
  }

  const activeZone = activeId ? zones.find((z) => z.id === activeId) : null;

  return (
    <div className="flex w-64 flex-col border-r border-border/50 bg-background">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <h2 className="text-sm font-semibold">Zones</h2>
        <Button variant="ghost" size="icon-xs" onClick={handleAddZone} title="Add zone">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {zones.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-xs text-muted-foreground">No zones yet.</p>
            <Button variant="outline" size="sm" onClick={handleAddZone}>
              <Plus className="mr-1 h-3 w-3" />
              Add first zone
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={zones.map((z) => z.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {zones.map((zone) => (
                  <SortableZoneItem
                    key={zone.id}
                    zone={zone}
                    isSelected={zone.id === selectedZoneId}
                    onSelect={() => setSelectedZoneId(zone.id)}
                    onDelete={() => removeZone(zone.id)}
                    onDuplicate={() => duplicateZone(zone.id)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
              {activeZone ? (
                <ZoneItemContent zone={activeZone} isSelected={false} isDragOverlay />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <div className="border-t border-border/50 px-3 py-2">
        <p className="text-[10px] text-muted-foreground">
          {zones.length} zone{zones.length !== 1 && "s"} &middot; Drag to reorder
        </p>
      </div>
    </div>
  );
}

function SortableZoneItem({
  zone,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  zone: PersonalizationZone;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: zone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} onClick={onSelect}>
      <ZoneItemContent
        zone={zone}
        isSelected={isSelected}
        dragListeners={listeners}
        dragAttributes={attributes}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </div>
  );
}

function ZoneItemContent({
  zone,
  isSelected,
  isDragOverlay,
  dragListeners,
  dragAttributes,
  onDelete,
  onDuplicate,
}: {
  zone: PersonalizationZone;
  isSelected: boolean;
  isDragOverlay?: boolean;
  dragListeners?: ReturnType<typeof useSortable>["listeners"];
  dragAttributes?: ReturnType<typeof useSortable>["attributes"];
  onDelete?: () => void;
  onDuplicate?: () => void;
}) {
  const Icon = TYPE_ICONS[zone.type];
  const colorClass = TYPE_COLORS[zone.type];

  return (
    <div
      className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50"
      } ${isDragOverlay ? "shadow-lg bg-card border border-border" : ""}`}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...dragListeners}
        {...dragAttributes}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <Icon className={`h-3.5 w-3.5 shrink-0 ${colorClass}`} />

      <span className="flex-1 truncate text-xs font-medium">{zone.name}</span>

      {!isDragOverlay && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.();
            }}
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            className="rounded p-0.5 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
