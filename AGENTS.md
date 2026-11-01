# AGENTS WORKSPACE GUIDELINES

This file serves as the primary instructions and architecture reference for AI coding agents operating within this repository.

## 1. Project Overview & Architecture
* **Framework**: React 19 (pure functional components with TypeScript)
* **Build System**: Vite 8 with `@tailwindcss/vite`
* **Routing**: `@tanstack/react-router` (typed file-based routes in `src/routes/`)
* **Data Fetching**: `@tanstack/react-query` v5 with centralized client in `src/shared/api/client.ts`
* **Global State**: `zustand` (fine-grained atomic selectors)
* **Styling**: Tailwind CSS v4 with design tokens in `src/App.css`
* **Component Primitives**: `shadcn-ui` (configured in `components.json`) + Radix UI + `cn()` utility (`@/shared/utils/cn`)
* **Icon Systems**: `lucide-react` (standard semantic UI icons) & `@fortawesome/react-fontawesome` (brand & legacy icons)

---

## 2. Mandatory Rules Summary
1. **Repository First**: Always inspect existing code and reuse established patterns before writing new code.
2. **Minimal Change**: Make surgical, minimal changes. Do not reformat or refactor unrelated files.
3. **Zero Hardcoded Colors**: Strictly use semantic design tokens (`bg-surface`, `bg-surface-inner`, `text-text`, `text-text-muted`, `border-border`, `bg-primary`).
4. **Strict Dependency Guard**: Do not install new third-party UI libraries without explicit instruction. Use Tailwind or `shadcn` primitives.
5. **No `any` in TypeScript**: Explicit types or `unknown` with type guards.
6. **Verification Required**: Run `pnpm tsc --noEmit` and `pnpm build` to verify every major change.

---

## 3. Customizations & Tools Map
* **Shadcn CLI**:
  ```bash
  pnpm dlx shadcn@latest add <component>
  ```
  Components are added directly to `src/shared/components/ui/` and adapted to project design tokens.
* **Agent Rules**: Located in `.agent/rules/`:
  * `00-core-rules.md`: General repository & cleanup guidelines
  * `01-ui-rules.md`: UI & visual minimal design guidelines
  * `02-security-api-rules.md`: Security, authentication, and API contract rules
  * `03-react19-tanstack-rules.md`: React 19, Router, Query, and Zustand patterns
  * `04-design-system-rules.md`: Tailwind v4 tokens, a11y, and icon system
* **Agent Skills**: Located in `.agent/skills/`:
  * `shadcn-skill`: Adding & configuring UI primitives
  * `design-to-code-skill`: Translating design prompts/wireframes into Tailwind/React components
  * `icon-skill`: Semantic search and import for Lucide icons
  * `ui-skill`: UI layout, responsive behavior, visual hierarchy
  * `api-skill`, `auth-skill`, `database-skill`, `search-skill`, `clean-skill`, `debugging-skill`
