import React, { useCallback, useMemo, useState } from "react";
import type { KanbanState, ColumnId } from "./types";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { addCard, deleteCard, moveCard, renameCard } from "./kanbanOps";

type Props = {
  value: KanbanState;
  onChange: (next: KanbanState) => void;
};

type CardDragId = `card:${string}`;
type ColDragId = `col:${ColumnId}`;

function cardIdToDrag(id: string): CardDragId {
  return `card:${id}`;
}
function dragToCardId(dragId: string): string {
  return dragId.replace(/^card:/, "");
}
function colIdToDrag(id: ColumnId): ColDragId {
  return `col:${id}`;
}
function dragToColId(dragId: string): ColumnId {
  return dragId.replace(/^col:/, "") as ColumnId;
}

export function KanbanBoard({ value, onChange }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columnIds = value.columnOrder;

  const cardToColumn = useMemo(() => {
    const m = new Map<string, ColumnId>();
    for (const colId of columnIds) {
      for (const cid of value.columns[colId].cardIds) m.set(cid, colId);
    }
    return m;
  }, [value, columnIds]);

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over) return;

      const a = String(active.id);
      const o = String(over.id);
      if (!a.startsWith("card:")) return;

      const movingCardId = dragToCardId(a);

      if (o.startsWith("col:")) {
        const toCol = dragToColId(o);
        const fromCol = cardToColumn.get(movingCardId);
        if (!fromCol) return;

        const toIndex = value.columns[toCol].cardIds.length;
        onChange(moveCard(value, fromCol, toCol, movingCardId, toIndex));
        return;
      }

      if (o.startsWith("card:")) {
        const overCardId = dragToCardId(o);
        const fromCol = cardToColumn.get(movingCardId);
        const toCol = cardToColumn.get(overCardId);
        if (!fromCol || !toCol) return;

        const toIndex = value.columns[toCol].cardIds.indexOf(overCardId);
        onChange(moveCard(value, fromCol, toCol, movingCardId, toIndex));
      }
    },
    [value, onChange, cardToColumn]
  );

  return (
    <div>
      <div className="muted" style={{ marginBottom: 10 }}>
        Drag cards across columns. Double-click a card to edit. Columns stack on small screens.
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="board">
          {columnIds.map((colId) => {
            const col = value.columns[colId];
            const items = col.cardIds.map(cardIdToDrag);
            return (
              <div key={colId} className="column">
                <div className="colHead">
                  <div className="row">
                    <span>{col.title}</span>
                    <span className="badge">{col.cardIds.length}</span>
                  </div>
                  <button
                    className="smallBtn"
                    onClick={() => {
                      const title = window.prompt("Card title?");
                      if (!title || !title.trim()) return;
                      onChange(addCard(value, colId, title.trim()));
                    }}
                    title="Add card"
                  >
                    +
                  </button>
                </div>

                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                  <div className="colBody" id={colId}>
                    <ColumnDropZone colId={colId} />
                    {col.cardIds.map((cid) => (
                      <KanbanCard
                        key={cid}
                        cardId={cid}
                        title={value.cards[cid]?.title ?? ""}
                        onDelete={() => onChange(deleteCard(value, cid))}
                        onRename={(t) => onChange(renameCard(value, cid, t))}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

function ColumnDropZone({ colId }: { colId: ColumnId }) {
  const { setNodeRef } = useSortable({ id: colIdToDrag(colId), disabled: true });
  return <div ref={setNodeRef} style={{ height: 1 }} />;
}

function KanbanCard({
  cardId,
  title,
  onDelete,
  onRename,
}: {
  cardId: string;
  title: string;
  onDelete: () => void;
  onRename: (t: string) => void;
}) {
  const dragId = cardIdToDrag(cardId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dragId });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  React.useEffect(() => setDraft(title), [title]);

  return (
    <div ref={setNodeRef} style={style} className="cardItem">
      <div>
        {editing ? (
          <input
            className="input"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              setEditing(false);
              const next = draft.trim();
              if (next) onRename(next);
              else setDraft(title);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setDraft(title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <div className="cardTitle" onDoubleClick={() => setEditing(true)} title="Double-click to edit">
            {title}
          </div>
        )}
        <div className="muted">Drag handle on right</div>
      </div>

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="smallBtn danger" onClick={onDelete} title="Delete">🗑</button>
        <div
          className="smallBtn"
          style={{ display: "grid", placeItems: "center", width: 38 }}
          {...attributes}
          {...listeners}
          title="Drag"
        >
          ⠿
        </div>
      </div>
    </div>
  );
}

export type { KanbanState } from "./types";
