import React, { useMemo, useState } from "react";
import { TreeView, type TreeNode } from "./components/tree/TreeView";
import { KanbanBoard, type KanbanState } from "./components/kanban/KanbanBoard";
import { createInitialKanban } from "./components/kanban/mock";
import { createInitialTree, mockFetchChildren } from "./components/tree/mock";

type Tab = "tree" | "kanban";

export default function App() {
  const [tab, setTab] = useState<Tab>("tree");

  const [tree, setTree] = useState<TreeNode[]>(() => createInitialTree());
  const [kanban, setKanban] = useState<KanbanState>(() => createInitialKanban());

  const title = tab === "tree" ? "Tree View Component" : "Kanban Board Component";

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1 className="h1">{title}</h1>
          <div className="tabs" role="tablist" aria-label="Examples">
            <button className="tabBtn" role="tab" aria-selected={tab === "tree"} onClick={() => setTab("tree")}>
              Tree
            </button>
            <button className="tabBtn" role="tab" aria-selected={tab === "kanban"} onClick={() => setTab("kanban")}>
              Kanban
            </button>
          </div>
        </div>
        <div className="content">
          {tab === "tree" ? (
            <TreeView
              value={tree}
              onChange={setTree}
              fetchChildren={mockFetchChildren}
            />
          ) : (
            <KanbanBoard value={kanban} onChange={setKanban} />
          )}
        </div>
      </div>
    </div>
  );
}
