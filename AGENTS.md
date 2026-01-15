# AGENTS.md

## Repository Overview
- Stack: React + Vite, Firebase (Auth + Firestore), CSS Modules.
- Language: JavaScript (ES Modules).
- Entry points: `src/main.jsx`, `src/App.jsx`.
- Auth helpers: `src/lib/auth.js`.
- Data layer: `src/lib/expenses.remote.js`.
- Styling: CSS Modules with shared variables in `src/index.css`.

## Build / Lint / Test Commands
- Install dependencies: `npm install`
- Development server: `npm run dev`
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
- Keep CSS properties sorted in logical groupings (layout → typography → color).
- Avoid inline styles in JSX.

### Imports
- Group imports in this order:
  1. External libraries (React, router, Firebase)
  2. Internal modules (`../lib/...`)
  3. Local styles (`./*.module.css`)
- Sort named imports alphabetically.
- Avoid default React import; use named hooks: `import { useState } from "react"`.
- Avoid unused imports; remove immediately.
- Keep import blocks separated by a single blank line.

### Components
- Use PascalCase for component names.
- Keep components small and focused; split complex views.
- Destructure props when practical.
- Keep render bodies shallow; extract helpers to `src/lib` as needed.
- Prefer controlled inputs for form fields.

### State & Effects
- Use `useState` for local state, `useEffect` for side effects.
- Ensure effects declare all dependencies.
- Use `useMemo` for derived totals from large arrays.
- Avoid re-creating functions in render when not needed.
- Keep async effects wrapped in `useEffect` with inner async functions.

### Naming Conventions
- `camelCase` for variables and functions.
- `PascalCase` for components.
- `UPPER_SNAKE_CASE` for constants only when truly global.
- Use descriptive names (e.g., `resetPassword`, `refreshUser`).
- Prefer verbs for functions and actions (e.g., `fetchExpenses`).

### Error Handling
- Use `try/catch` for async flows in UI.
- Provide user-friendly error messages in UI states.
- Avoid swallowing errors silently.
- For Firebase errors, use `ex?.message` fallback strings.
- Return early on validation failures with clear messages.

### API / Data Access
- Keep Firebase logic inside `src/lib/*` modules.
- Do not call Firebase directly from components.
- Prefer async/await over promise chains.
- Validate inputs before sending to data layer.
- Keep Firestore collection names centralized in helpers.

### Auth
- Use `observeAuth` for session updates.
- Verify `emailVerified` before protected access.
- Use `sendPasswordResetEmail` for password resets.
- Keep auth state in the top-level layout or provider.

### Routing
- Keep route components light; push data loading into hooks/helpers.
- Avoid deep prop drilling; pass minimal props.
- Prefer redirect guards for protected routes.

### CSS Modules
- Keep class names semantic: `.card`, `.headerActions`.
- Reuse existing variables from `:root` in `src/index.css`.
- Avoid global styles unless truly app-wide.
- Keep CSS Modules file names aligned with component names.

### Type Safety
- Project is JavaScript only; no TypeScript checks.
- Avoid implicit type coercion; explicitly parse numbers.
- Normalize numeric inputs before calculating totals.

### Performance
- Use `useMemo` for derived totals from large arrays.
- Avoid re-creating functions in render when not needed.
- Keep lists keyed with stable IDs from Firestore.

### Accessibility
- Always label form inputs.
- Buttons that look like links should still be `<button>`.
- Use `type="button"` for non-submit buttons.
- Ensure form controls have `aria` labels when needed.

### Security & Secrets
- Never commit Firebase service account JSON.
- Use GitHub Actions secrets for CI/CD.
- Avoid logging sensitive auth data in the UI.

## Tooling & Linting
- `npm run lint` uses ESLint.
- Fix lint errors immediately before merging.
- Use Prettier only if added to the repo later.

## CI/CD Notes
- GitHub Actions workflows live in `.github/workflows`.
- Ensure CI builds install dependencies before running `vite build`.

## Cursor / Copilot Instructions
- No `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` found.

## Change Log
- 2026-01-15: Expanded guidance for build, lint, and style rules.
