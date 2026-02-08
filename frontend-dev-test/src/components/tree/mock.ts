import type { TreeNode } from "./types";
import { uid } from "../../utils/id";

const COLORS = ["#2563eb", "#16a34a", "#9333ea", "#f97316", "#0f766e"];

function makeNode(name: string, depth: number, hasChildren: boolean): TreeNode {
  return {
    id: uid("node"),
    name,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    hasChildren,
    
    children: hasChildren ? undefined : [],
  };
}

export function createInitialTree(): TreeNode[] {
  return [
    { ...makeNode("Level A", 0, true) },
    { ...makeNode("Level B", 0, true) },
    { ...makeNode("Level C", 0, false) },
  ];
}


export async function mockFetchChildren(nodeId: string): Promise<TreeNode[]> {
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
  const count = 1 + Math.floor(Math.random() * 4);
  const letters = ["A", "B", "C", "D", "E"];
  const out: TreeNode[] = [];
  for (let i = 0; i < count; i++) {
    const hasKids = Math.random() < 0.55;
    out.push(makeNode(`Level ${letters[Math.floor(Math.random() * letters.length)]}`, 1, hasKids));
  }
  return out;
}
