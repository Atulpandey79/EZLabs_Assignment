# Front-End Developer Test (React + TypeScript)

This project implements:
- **Tree View Component** with expand/collapse, add, remove (with confirm), edit, drag & drop, and lazy loading simulation.
- **Kanban Board Component** with 3 columns (Todo/In Progress/Done), add/delete cards, inline edit, and drag & drop.

## Run locally
1. Install Node.js 18+
2. In this folder:

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Notes (matching the PDF)
- Tree drag & drop defaults to **reorder within the same level** (requirement).
- To also demonstrate **cross-parent moves**, hold **Alt** while dropping.
- Tree lazy loading: nodes with `hasChildren: true` start with `children: undefined` and are fetched on expand.

