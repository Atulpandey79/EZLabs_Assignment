export type ColumnId = "todo" | "inprogress" | "done";

export type Card = {
  id: string;
  title: string;
};

export type Column = {
  id: ColumnId;
  title: string;
  cardIds: string[];
};

export type KanbanState = {
  cards: Record<string, Card>;
  columns: Record<ColumnId, Column>;
  columnOrder: ColumnId[];
};
