# Changelog

Breaking changes are marked **Breaking**. Products pin a tag; see `CONTRIBUTING.md`.

## Unreleased

- Component CSS (`dist/components.css`): button (primary, ghost, tertiary), card, pill, tag, stat, step, check item, with Storybook stories. Merged to `main` but not tagged. It has no responsive rules yet, so products should not migrate to it until v0.2.0.

## Roadmap

Based on a comparison with GitHub Primer, the GOV.UK Design System and IBM Carbon (October 2026). Each version is tagged only when its components are in Storybook and meet the checklist in `CONTRIBUTING.md`.

- **v0.2.0:** responsive rules for the existing components, stat bar, text link, external link, nav link and skip link. Then the portfolio migrates onto it.
- **v0.3.0:** form controls (text input, textarea, select, checkbox, radio, toggle, form field with label, hint and error) and feedback (status badge, banner, inline message).
- **v0.4.0:** tabs, table and accordion.
- **Later, only when a product needs them:** modal, tooltip, progress and loading, breadcrumbs, pagination.
- **Not planned:** date picker, tree view, file upload, data-table features.

## v0.1.0

- Design tokens in the W3C design-token format (primitives, semantic roles, component values), built to `dist/tokens.css`, `dist/legacy-aliases.css` and `dist/tokens.resolved.json`, with a validator that enforces structure, tier direction and WCAG 2.2 contrast.
