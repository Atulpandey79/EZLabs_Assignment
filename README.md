# EZLabs Frontend Assignment

This repository contains the solution for the **EZLabs Frontend Developer Assignment**, implemented using **React + TypeScript** and built with **Vite**.

The project includes:
1. A **Tree View component** with lazy loading and drag-and-drop
2. A **Kanban Board component** with multi-column drag-and-drop

---

## Tech Stack

- React 18
- TypeScript
- Vite
- @dnd-kit (Drag and Drop)
- Plain CSS (no UI framework)

---

## Features

### Tree View Component
- Expand / collapse nodes
- Lazy loading of child nodes (simulated async fetch)
- Add child node
- Edit node name
- Delete node (with confirmation, removes subtree)
- Drag & drop reordering **within the same level**
- Recursive data structure with clean state updates

> Note: Drag-and-drop is intentionally restricted to the same hierarchy level to match the assignment requirement.

---

### Kanban Board Component
- Three default columns: **Todo**, **In Progress**, **Done**
- Add new cards
- Edit card title (inline)
- Delete cards
- Drag cards between columns
- Maintains card order within columns
- Responsive layout (stacks on small screens)

---

## Project Structure

<img width="254" height="470" alt="Screenshot 2026-02-08 at 9 02 56 AM" src="https://github.com/user-attachments/assets/d7a52ed6-e6c5-41a6-aacc-cbfefb38a8fa" />


---

## Setup & Run Locally

### Prerequisites
- Node.js **18+**
- npm

### Steps
```bash
npm install
npm run dev
