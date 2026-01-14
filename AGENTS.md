# AGENTS.md

## Repository Overview
- Stack: React + Vite, Firebase (Auth + Firestore), CSS Modules.
- Language: JavaScript (ES Modules).
- Entry points: `src/main.jsx`, `src/App.jsx`.
- Auth helpers: `src/lib/auth.js`.
- Data layer: `src/lib/expenses.remote.js`.

## Build / Lint / Test Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`
- Lint: `npm run lint`

### Tests
- No test runner is configured in this repo.
- Single test execution is **not available**.
- If tests are added later, document the single-test command here.

## Code Style Guidelines

### Formatting
- Use 2-space indentation.
- Use double quotes for strings.
- Always include semicolons.
- Keep JSX props aligned and readable.
- Prefer trailing commas in multi-line lists.
- Keep CSS properties sorted in a logical grouping (layout → typography → color).

### Imports
- Group imports in this order:
  1. External libraries (React, router, Firebase)
  2. Internal modules (`../lib/...`)
  3. Local styles (`./*.module.css`)
- Sort named imports alphabetically.
- Avoid default React import; use named hooks: `import { useState } from "react"`.
- Avoid unused imports; remove immediately.

### Components
- Use PascalCase for component names.
- Keep components small and focused; prefer splitting complex views.
- Avoid inline styles; use CSS Modules.
- Destructure props when practical.

### State & Effects
- Use `useState` for local state, `useEffect` for side effects.
- Ensure effects declare all dependencies.
- Keep derived state in `useMemo` if it is computed from large lists.

### Naming Conventions
- `camelCase` for variables and functions.
- `PascalCase` for components.
- `UPPER_SNAKE_CASE` for constants only when truly global.
- Use descriptive names (e.g., `resetPassword`, `refreshUser`).

### Error Handling
- Use `try/catch` for async flows in UI.
- Provide user-friendly error messages in UI states.
- Avoid swallowing errors silently.
- For Firebase errors, use `ex?.message` fallback strings.

### API / Data Access
- Keep Firebase logic inside `src/lib/*` modules.
- Do not call Firebase directly from components.
- Prefer async/await over promise chains.
- Validate inputs before sending to data layer.

### Auth
- Use `observeAuth` for session updates.
- Verify `emailVerified` before protected access.
- Use `sendPasswordResetEmail` for password resets.

### CSS Modules
- Keep class names semantic: `.card`, `.headerActions`.
- Reuse existing variables from `:root` in `src/index.css`.
- Avoid global styles unless truly app-wide.

### Type Safety
- Project is JavaScript only; no TypeScript checks.
- Avoid implicit type coercion; explicitly parse numbers.

### Performance
- Use `useMemo` for derived totals from large arrays.
- Avoid re-creating functions in render when not needed.

### Accessibility
- Always label form inputs.
- Buttons that look like links should still be `<button>` for accessibility.
- Use `type="button"` for non-submit buttons.

## Linting
- `npm run lint` uses ESLint.
- Fix lint errors immediately before merging.

## Cursor / Copilot Instructions
- No `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` found.

## Change Log
- 2026-01-15: Created `AGENTS.md` with build/lint commands and style guidance.
