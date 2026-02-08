import type { KanbanState, ColumnId } from "./types";
import { uid } from "../../utils/id";

export function addCard(state: KanbanState, columnId: ColumnId, title: string): KanbanState {
  const id = uid("card");
  return {
    ...state,
    cards: { ...state.cards, [id]: { id, title } },
    columns: {
      ...state.columns,
      [columnId]: { ...state.columns[columnId], cardIds: [...state.columns[columnId].cardIds, id] },
    },
  };
}

export function deleteCard(state: KanbanState, cardId: string): KanbanState {
  const cards = { ...state.cards };
  delete cards[cardId];
  const columns = { ...state.columns };
  for (const colId of state.columnOrder) {
    columns[colId] = { ...columns[colId], cardIds: columns[colId].cardIds.filter((id) => id !== cardId) };
  }
  return { ...state, cards, columns };
}

export function renameCard(state: KanbanState, cardId: string, title: string): KanbanState {
  return { ...state, cards: { ...state.cards, [cardId]: { ...state.cards[cardId], title } } };
}

export function moveCard(
  state: KanbanState,
  fromColumn: ColumnId,
  toColumn: ColumnId,
  cardId: string,
  toIndex: number
): KanbanState {
  const next = structuredClone(state) as KanbanState;
  next.columns[fromColumn].cardIds = next.columns[fromColumn].cardIds.filter((id) => id !== cardId);
  const ids = next.columns[toColumn].cardIds;
  const clamped = Math.max(0, Math.min(toIndex, ids.length));
  ids.splice(clamped, 0, cardId);
  return next;
}
