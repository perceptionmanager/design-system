# Changelog

Breaking changes are marked **Breaking**. Products pin a tag; see `CONTRIBUTING.md`.

## Unreleased

- **Typography (visible change):** `font.family.display` is now IBM Plex Serif (was Fraunces), so headings, stat values and step numbers change face in every product. Load IBM Plex Serif 400, 500 and 600 where Fraunces was loaded. Sizes, weights and line heights are unchanged.
- **Card:** `pm-card--accent-gradient`, a 3px brand-gradient bar along the top edge. Found while migrating the portfolio: its patient-portal scenario cards used a custom gradient bar the card did not cover.

## v0.2.0 (2026-10-18)

- **Components** (`dist/components.css`, `@layer components`, `.pm-*` classes): button (primary, ghost, tertiary, with leading, trailing or icon-only icons), card with accent bar, pill (static and interactive: hover, selected, focus, disabled), tag, stat and stat bar, step, check item. Responsive rules at 860px and a forced-colors block are included.
- **Links:** text link, external link, nav link with current-page marker, skip link, with a focus ring that stays clear of the underline.
- **Icons:** shared set of 12 icons in `icons/`, built to `dist/icons.svg` (sprite) and `dist/icons.json`. Copy the sprite into each product at a pinned version; a browser will not load it cross-origin.
- **Validation:** icon rules (24px viewBox, `currentColor`, no fixed colors) and a contrast gate on `gradient.brand` against `color.text.on-accent` (worst case 6.91:1).
- **Governance:** `CONTRIBUTING.md` (change path, new-component checklist, versioning, deprecation).
- Not breaking: tokens are unchanged from v0.1.0.

## Roadmap

Based on a comparison with GitHub Primer, the GOV.UK Design System and IBM Carbon (October 2026). Each version is tagged only when its components are in Storybook and meet the checklist in `CONTRIBUTING.md`.

- **v0.2.0 (released):** responsive rules for the existing components, stat bar, card accent bar, interactive pill, text link, external link, nav link, skip link, buttons with icons, and a shared icon set (12 icons). Then the portfolio migrates onto it.
- **v0.3.0:** form controls (text input, textarea, select, checkbox, radio, toggle, form field with label, hint and error) and feedback (status badge, banner, inline message).
- **v0.4.0:** tabs, table and accordion.
- **Later, only when a product needs them:** modal, tooltip, progress and loading, breadcrumbs, pagination.
- **Not planned:** date picker, tree view, file upload, data-table features.

## v0.1.0

- Design tokens in the W3C design-token format (primitives, semantic roles, component values), built to `dist/tokens.css`, `dist/legacy-aliases.css` and `dist/tokens.resolved.json`, with a validator that enforces structure, tier direction and WCAG 2.2 contrast.
