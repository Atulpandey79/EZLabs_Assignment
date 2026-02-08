import type { KanbanState } from "./types";
import { uid } from "../../utils/id";

export function createInitialKanban(): KanbanState {
  const c1 = uid("card"), c2 = uid("card"), c3 = uid("card"), c4 = uid("card"), c5 = uid("card"), c6 = uid("card");
  return {
    cards: {
      [c1]: { id: c1, title: "Create initial project plan" },
      [c2]: { id: c2, title: "Design landing page" },
      [c3]: { id: c3, title: "Review codebase structure" },
      [c4]: { id: c4, title: "Implement authentication" },
      [c5]: { id: c5, title: "Set up database schema" },
      [c6]: { id: c6, title: "Write API documentation" },
    },
    columns: {
      todo: { id: "todo", title: "Todo", cardIds: [c1, c2, c3] },
      inprogress: { id: "inprogress", title: "In Progress", cardIds: [c4, c5] },
      done: { id: "done", title: "Done", cardIds: [c6] },
    },
    columnOrder: ["todo", "inprogress", "done"],
  };
}
