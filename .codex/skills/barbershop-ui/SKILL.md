---
name: barbershop-ui
description: Use when editing Barber Shop SaaS screens, layouts, components, forms, tables, navigation, mobile UI, feedback states, or UI text. Applies to Next.js App Router UI work under src/app, src/components, src/constants/texts, and docs/ui.
---

# Barbershop UI

## Read First

- `CONTEXT.md`
- `docs/SCREENS.md`
- Search `src/components/global/` before creating or styling UI.

## References

- Read `references/component-rules.md` when placing, creating, or splitting components.
- Read `references/text-rules.md` when adding or changing UI copy, labels, options, statuses, or finite values.

## Workflow

1. Identify the target screen, route, and module.
2. Inspect existing global primitives and nearby module/screen components.
3. Reuse global components before creating module-specific UI.
4. Keep route files focused on route orchestration and page-level semantics.
5. Put reusable UI in `src/components/global/`; put module UI in `src/components/modules/<module>/`; put page-specific UI in `src/components/screens/<module-or-route>/`.
6. Put UI text in `src/constants/texts/`.
7. Put shared finite values in `src/constants/common/`.
8. Summarize completed changes in the final response.

## Verification

- Do not run tests or ESLint unless the user asks.
- For visual changes that start a dev server, verify the page in Browser when a local URL is known.
