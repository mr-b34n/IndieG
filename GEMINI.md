# GEMINI WORKSPACE INSTRUCTIONS

See [AGENTS.md](./AGENTS.md) for the complete project architectural guidelines, rules, and customization map.

## Core Directives
* Follow `.agent/rules/` for all coding, security, and UI decisions.
* Use `@/shared/utils/cn` for class merging.
* Use `pnpm dlx shadcn@latest add <component>` for standard UI primitives.
* Prefer `lucide-react` for clean semantic iconography.
* Verify work with `pnpm tsc --noEmit && pnpm build`.
