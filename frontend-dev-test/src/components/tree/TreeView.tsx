import React, { useCallback, useMemo, useState } from "react";
import type { TreeNode, Path } from "./types";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  insertNodeAsChild,
  isDescendantPath,
  keyToPath,
  moveNode,
  pathToKey,
  updateNodeAt,
  removeNodeAt,
} from "./treeOps";

type Props = {
  value: TreeNode[];
  onChange: (next: TreeNode[]) => void;
  fetchChildren: (nodeId: string) => Promise<TreeNode[]>;
};

type FlatRow = {
  id: string; // dnd id (pathKey)
  path: Path;
  node: TreeNode;
  depth: number;
};

export function TreeView({ value, onChange, fetchChildren }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const flat = useMemo(() => flatten(value, expanded), [value, expanded]);

  const sameLevelGroups = useMemo(() => {
    // group by parent path key; each group is a sortable list
    const m = new Map<string, string[]>();
    for (const r of flat) {
      const parentKey = pathToKey(r.path.slice(0, -1));
      if (!m.has(parentKey)) m.set(parentKey, []);
      m.get(parentKey)!.push(r.id);
    }
    return m;
  }, [flat]);

  const ensureChildrenLoaded = useCallback(
    async (path: Path) => {
      const node = getNode(value, path);
      if (!node) return;
      const isLazy = node.hasChildren && node.children === undefined;
      if (!isLazy) return;

      onChange(
        updateNodeAt(value, path, (n) => ({ ...n, isLoading: true }))
      );

      const children = await fetchChildren(node.id);
      onChange(
        updateNodeAt(value, path, (n) => ({ ...n, children, isLoading: false, hasChildren: children.length > 0 }))
      );
    },
    [value, onChange, fetchChildren]
  );

  const toggleExpand = useCallback(
    async (path: Path) => {
      const key = pathToKey(path);
      const next = !expanded[key];
      setExpanded((e) => ({ ...e, [key]: next }));
      if (next) {
        await ensureChildrenLoaded(path);
      }
    },
    [expanded, ensureChildrenLoaded]
  );

  const addChild = useCallback(
    async (path: Path) => {
      const name = window.prompt("New node name?");
      if (!name || !name.trim()) return;
      onChange(insertNodeAsChild(value, path, name.trim()));
      // auto expand parent so you can see the child
      const key = pathToKey(path);
      setExpanded((e) => ({ ...e, [key]: true }));
      await ensureChildrenLoaded(path);
    },
    [value, onChange, ensureChildrenLoaded]
  );

  const deleteNode = useCallback(
    (path: Path) => {
      const node = getNode(value, path);
      if (!node) return;
      const ok = window.confirm(`Delete "${node.name}" and its subtree?`);
      if (!ok) return;
      const { next } = removeNodeAt(value, path);
      onChange(next);
    },
    [value, onChange]
  );

  const editNode = useCallback(
    (path: Path) => {
      const node = getNode(value, path);
      if (!node) return;
      const name = window.prompt("Edit node name:", node.name);
      if (!name || !name.trim()) return;
      onChange(updateNodeAt(value, path, (n) => ({ ...n, name: name.trim() })));
    },
    [value, onChange]
  );

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over) return;
      const from = keyToPath(String(active.id));
      const to = keyToPath(String(over.id));
      if (from.length === 0 || to.length === 0) return;

      // prevent dropping into own descendant by reparenting logic below
      const fromParent = from.slice(0, -1);
      const toParent = to.slice(0, -1);

      const sameParent = pathToKey(fromParent) === pathToKey(toParent);

      // Default behavior: reorder within same parent level (requirement #4)
      if (sameParent) {
        const toIndex = to[to.length - 1]!;
        onChange(moveNode(value, from, toParent, toIndex));
        return;
      }

      // Bonus: allow moving across parents by dropping onto any row while holding Alt.
      // (Keeps "within same level" requirement safe by default.)
      const allowCross = (e.activatorEvent as PointerEvent | undefined)?.altKey === true;
      if (!allowCross) return;

      // Disallow moving into own descendant
      if (isDescendantPath(from, toParent)) return;

      const toIndex = to[to.length - 1]!;
      onChange(moveNode(value, from, toParent, toIndex));
    },
    [value, onChange]
  );

  return (
    <div>
      <div className="muted" style={{ marginBottom: 10 }}>
        Drag to reorder within the same level. Hold <b>Alt</b> while dropping to move across parents.
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {renderTree(flat, sameLevelGroups, {
            onToggle: toggleExpand,
            onAdd: addChild,
            onDelete: deleteNode,
            onEdit: editNode,
            expanded,
          })}
        </div>
      </DndContext>
    </div>
  );
}

function renderTree(
  rows: FlatRow[],
  groups: Map<string, string[]>,
  actions: {
    onToggle: (path: Path) => void;
    onAdd: (path: Path) => void;
    onDelete: (path: Path) => void;
    onEdit: (path: Path) => void;
    expanded: Record<string, boolean>;
  }
) {

  const out: React.ReactNode[] = [];
  const seenGroup = new Set<string>();

  for (const row of rows) {
    const parentKey = pathToKey(row.path.slice(0, -1));
    if (!seenGroup.has(parentKey)) {
      seenGroup.add(parentKey);
      const ids = groups.get(parentKey) ?? [];
      out.push(
        <SortableContext key={`grp:${parentKey || "root"}`} items={ids} strategy={verticalListSortingStrategy}>
          {ids.map((id) => {
            const r = rows.find((x) => x.id === id)!;
            return <TreeRow key={id} row={r} actions={actions} />;
          })}
        </SortableContext>
      );
    }
  }
  return out;
}

function TreeRow({ row, actions }: { row: FlatRow; actions: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    marginLeft: row.depth * 22,
  };

  const nodeKey = pathToKey(row.path);
  const isExpanded = actions.expanded[nodeKey] === true;
  const hasChildren = (row.node.hasChildren ?? false) || ((row.node.children?.length ?? 0) > 0);
  const isLazy = (row.node.hasChildren ?? false) && row.node.children === undefined;

  return (
    <div ref={setNodeRef} style={style} className="treeRow">
      <div className="chev" onClick={() => hasChildren && actions.onToggle(row.path)} title={hasChildren ? "Expand/collapse" : ""}>
        {hasChildren ? (isExpanded ? "▾" : "▸") : ""}
      </div>

      <div className="nodeIcon" style={{ background: row.node.color ?? "#111827" }} {...attributes} {...listeners} title="Drag">
        {row.node.name.trim().slice(0, 1).toUpperCase()}
      </div>

      <div>
        <div
          className="nodeName"
          onDoubleClick={() => actions.onEdit(row.path)}
          title="Double-click to edit"
        >
          {row.node.name}
        </div>
        {row.node.isLoading ? <div className="muted">Loading…</div> : isLazy && isExpanded ? <div className="muted">Loaded</div> : null}
      </div>

      <div className="row">
        <button className="smallBtn" onClick={() => actions.onAdd(row.path)} title="Add child">+</button>
        <button className="smallBtn" onClick={() => actions.onEdit(row.path)} title="Edit">Edit</button>
        <button className="smallBtn danger" onClick={() => actions.onDelete(row.path)} title="Delete">Del</button>
      </div>
    </div>
  );
}

function flatten(nodes: TreeNode[], expanded: Record<string, boolean>, parentPath: Path = [], depth = 0): FlatRow[] {
  const out: FlatRow[] = [];
  nodes.forEach((node, idx) => {
    const path = [...parentPath, idx];
    const id = pathToKey(path);
    out.push({ id, path, node, depth });

    const key = pathToKey(path);
    const isExpanded = expanded[key] === true;
    const kids = node.children;
    if (isExpanded && Array.isArray(kids) && kids.length > 0) {
      out.push(...flatten(kids, expanded, path, depth + 1));
    }
  });
  return out;
}

function getNode(root: TreeNode[], path: Path): TreeNode | null {
  let cur: any = root;
  for (let i = 0; i < path.length; i++) {
    const idx = path[i]!;
    const node = cur?.[idx] as TreeNode | undefined;
    if (!node) return null;
    if (i === path.length - 1) return node;
    cur = node.children ?? [];
  }
  return null;
}

export type { TreeNode } from "./types";
