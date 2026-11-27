# GEMINI WORKSPACE INSTRUCTIONS

See [AGENTS.md](./AGENTS.md) and [.ag_workflow/CONSTITUTION.md](./.ag_workflow/CONSTITUTION.md) for complete project architectural guidelines, rules, constitution, and customization map.

## Core Directives
* Follow `.ag_workflow/CONSTITUTION.md` for all architecture, typing, and verification rules.
* Follow `.agent/rules/` for all coding, security, and UI decisions.
* Use `@/shared/utils/cn` for class merging.
* Use `pnpm dlx shadcn@latest add <component>` for standard UI primitives.
* Prefer `lucide-react` for clean semantic iconography.
* Verify work with `pnpm tsc --noEmit && pnpm test && pnpm build`.

