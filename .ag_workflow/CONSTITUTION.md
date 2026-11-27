# PROJECT CONSTITUTION & ENGINEERING STANDARDS
# Project: Ludon Frontend (React 19 + TypeScript + Vite + Tailwind v4 + TanStack)

This constitution defines the mandatory engineering laws and quality gates for autonomous agentic workflows and development in this codebase. Every agent and automated script MUST adhere strictly to these rules.

---

## 1. Stack & Architectural Conventions

1. **Framework & Runtime**:
   - React 19 with pure functional components and strict TypeScript.
   - Node.js >= 22 (current runtime: Node 24 with pnpm).
   - Vite 8 with `@tailwindcss/vite`.
2. **Routing**:
   - TanStack Router (`@tanstack/react-router`) with typed file-based routes in `src/routes/`.
   - Do not manually manipulate `window.location`; use router navigation hooks and `<Link>`.
3. **Data Fetching & Server State**:
   - TanStack Query v5 (`@tanstack/react-query`) with centralized client in `src/shared/api/client.ts`.
   - Wrap queries in cohesive hooks; handle loading, error, and stale states properly.
4. **Client State**:
   - Zustand v5 (`zustand`). Use fine-grained atomic selectors (e.g. `useStore(state => state.foo)`) to prevent unnecessary re-renders. Never subscribe to the entire store unless strictly required.
5. **Styling & Design System**:
   - Tailwind CSS v4 design tokens defined in `src/App.css`.
   - **Zero Hardcoded Colors**: Strictly use semantic design tokens:
     - Backgrounds: `bg-surface`, `bg-surface-inner`, `bg-primary`, `bg-primary-hover`
     - Text: `text-text`, `text-text-muted`, `text-text-subtle`, `text-primary`
     - Borders: `border-border`, `border-border-subtle`
   - Class Merging: Always use `@/shared/utils/cn` for dynamic className combination.
6. **Icons & Assets**:
   - Prefer `lucide-react` for standard UI iconography.
   - Use `@fortawesome/react-fontawesome` only for specific brand icons or established legacy items.
7. **Path Aliasing**:
   - Use configured aliases: `@/` (`src/`), `@/features/`, `@/shared/`, `@/app/`.

---

## 2. Strict Typing & Code Standards

1. **Absolute Zero `any`**:
   - Explicit types or `unknown` with type guards/narrowing.
   - No `@ts-ignore` or `@ts-nocheck` without explicit documented authorization.
2. **React 19 Best Practices**:
   - Never call `setState` synchronously within a `useEffect` body to avoid cascading re-renders.
   - Prefer deriving state during rendering or lifting state up.
   - Keep effect dependency arrays accurate and complete.
3. **Clean Code & Bloat Prevention**:
   - Surgical, minimal diffs. Do not reformat or churn unrelated code.
   - No dead code, unused imports, or unused variables. Remove unused variables immediately.

---

## 3. Mandatory AI Verification Rule

> [!CRITICAL]
> **MANDATORY LAW: VERIFICATION BEFORE COMPLETION**
> An autonomous agent or automated script MUST NEVER mark a task as complete, emit `STATUS: DONE`, or declare success without explicitly executing the project's quality gates and verifying clean zero-error outputs:
> 1. Typecheck: `pnpm tsc --noEmit` must pass with 0 exit code.
> 2. Unit Tests: `pnpm test` (Vitest) must pass with 0 exit code.
> 3. Production Build: `pnpm build` must succeed without build errors.

---

## 4. Error Handling & Quality Gates

1. Defensive parsing: Validate inputs and external responses with Zod or explicit runtime checks.
2. Graceful degradation: UI components must handle loading, empty, and error states gracefully with fallback UI or skeletons.
3. Any regression or failed test in `.ag_workflow/state/test_output.log` requires immediate root-cause remediation before proceeding.
