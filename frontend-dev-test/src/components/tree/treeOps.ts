import type { Path, TreeNode } from "./types";
import { uid } from "../../utils/id";

export function getNodeAt(root: TreeNode[], path: Path): TreeNode | null {
  let cur: any = root;
  for (const idx of path) {
    if (!Array.isArray(cur)) return null;
    cur = cur[idx];
    if (!cur) return null;
    if (idx !== path[path.length - 1]) cur = cur.children;
  }
  return cur as TreeNode;
}

export function updateNodeAt(root: TreeNode[], path: Path, updater: (n: TreeNode) => TreeNode): TreeNode[] {
  if (path.length === 0) return root;
  const clone = structuredClone(root) as TreeNode[];
  let arr: any = clone;
  for (let d = 0; d < path.length - 1; d++) {
    const idx = path[d]!;
    arr[idx] = { ...arr[idx], children: (arr[idx].children ?? []).slice() };
    arr = arr[idx].children;
  }
  const last = path[path.length - 1]!;
  arr[last] = updater(arr[last]);
  return clone;
}

export function removeNodeAt(root: TreeNode[], path: Path): { next: TreeNode[]; removed?: TreeNode } {
  const clone = structuredClone(root) as TreeNode[];
  if (path.length === 0) return { next: clone };
  let arr: any = clone;
  for (let d = 0; d < path.length - 1; d++) {
    const idx = path[d]!;
    arr[idx] = { ...arr[idx], children: (arr[idx].children ?? []).slice() };
    arr = arr[idx].children;
  }
  const last = path[path.length - 1]!;
  const removed = arr[last] as TreeNode | undefined;
  arr.splice(last, 1);
  return { next: clone, removed };
}

export function insertNodeAsChild(root: TreeNode[], parentPath: Path, name: string): TreeNode[] {
  const child: TreeNode = { id: uid("node"), name, hasChildren: false, children: [] };
  if (parentPath.length === 0) {
    return [...root, child];
  }
  const clone = structuredClone(root) as TreeNode[];
  let arr: any = clone;
  for (let d = 0; d < parentPath.length; d++) {
    const idx = parentPath[d]!;
    arr[idx] = { ...arr[idx], children: (arr[idx].children ?? []).slice(), hasChildren: true };
    if (d === parentPath.length - 1) {
      arr[idx].children!.push(child);
    } else {
      arr = arr[idx].children;
    }
  }
  return clone;
}

export function moveNode(root: TreeNode[], from: Path, toParent: Path, toIndex: number): TreeNode[] {
  // Remove first
  const { next: removedTree, removed } = removeNodeAt(root, from);
  if (!removed) return root;

  const clone = structuredClone(removedTree) as TreeNode[];

  // Insert into parent
  if (toParent.length === 0) {
    const arr = clone.slice();
    arr.splice(toIndex, 0, removed);
    return arr;
  }

  let arr: any = clone;
  for (let d = 0; d < toParent.length; d++) {
    const idx = toParent[d]!;
    arr[idx] = { ...arr[idx], children: (arr[idx].children ?? []).slice(), hasChildren: true };
    if (d === toParent.length - 1) {
      const kids = arr[idx].children!;
      kids.splice(toIndex, 0, removed);
    } else {
      arr = arr[idx].children;
    }
  }
  return clone;
}

export function pathToKey(path: Path) {
  return path.join(".");
}
export function keyToPath(key: string): Path {
  if (!key) return [];
  return key.split(".").map((x) => Number(x));
}

export function isDescendantPath(ancestor: Path, possibleDescendant: Path) {
  if (ancestor.length >= possibleDescendant.length) return false;
  for (let i = 0; i < ancestor.length; i++) {
    if (ancestor[i] !== possibleDescendant[i]) return false;
  }
  return true;
}
