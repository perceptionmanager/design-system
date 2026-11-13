# Changelog

Breaking changes are marked **Breaking**. Products pin a tag; see `CONTRIBUTING.md`.

## v0.6.0 (2026-11-13)

- **Standard footer:** `shell.js` fills any `<footer data-pm-footer>` with the one footer every product shows (copyright with the current year; built with Figma and Claude, source on GitHub, deployed on Vercel, validated by human; logos inlined). Products no longer write their own footer text.
- **Tokens:** `color.border.control` (control edges at 3:1 or more in both themes), `field.*`, `control.*`, `meter.*`, `spinner.*`, `font.family.mono`, and `color.status.success-subtle` / `-border`. New contrast gates for controls. Inventory behind them: `docs/inventory-v0.6.md`.
- **Form fields (new):** `.pm-field` with label, helper, error and character count; `.pm-input`, `.pm-textarea` (+ `--code`), `.pm-select`, `.pm-checkbox`, `.pm-radio`, `.pm-choice` and `.pm-fieldset`. Markup in `docs/forms.md`.
- **Feedback (new):** status badge (`.pm-badge`, severity and result tones), status line (`.pm-status`), alert (`.pm-alert`, error, warning, success, neutral, inline), loading indicator (`.pm-spinner`, `.pm-loading`, spinner in an `aria-busy` button) and meter (`.pm-meter`). Markup in `docs/feedback.md`.
- **Modal (new):** `.pm-modal` on a native `<dialog>` (focus trap, Escape, inert page and focus return from the browser). Image modal wired by `shell.js` for any `data-modal-src` button, plus `pmShell.openImage()`; panel modal for confirmations and short forms. Markup in `docs/modal.md`.
- **Page layout (new, in `shell.css`):** the base reset (including `[hidden]` always hiding, even on a component with its own display) and the Lab page patterns the three tools each copied: `.pm-wrap`, `.pm-hero`, `.pm-section`, `.pm-split`, `.pm-fade-in`, `.pm-split-word`. Markup in `docs/layout.md`. Most of the ~340 lines each tool copied were portfolio case-study styles the tools never used; those go away in the migration rather than into the design system.

## v0.5.0 (2026-11-12)

- **Pills and tags are opaque (visible change):** `pm-pill`, `pm-tag` and the selected interactive pill now use the page color instead of a see-through tint, so the backdrop glows no longer show through them. Matches what the portfolio already did with an override.
- **Page shell (new):** `dist/shell.css` and `dist/shell.js`, with the markup in `docs/shell.md`. Covers the skip link, site header (name, NN/g credential, nav with current-page marker, theme switch, menu button, reading-progress bar), full-screen mobile menu, footer with tool logos, and the backdrop (grain, aura, drifting glows, engraved line pattern). Taken from the portfolio, where it was built; the portfolio and the Lab tools now load the same files instead of keeping copies. One fix on the way: between 861px and 1140px the header was wider than the window and pushed the theme switch off the right edge; there the links now close up and the credential shows only its ID.
- **Compact header:** `.pm-site-header__cta` for headers with only the name, credential, one button and the theme switch (the Lab tools). The button stays on phones and turns icon-only below 600px.
- **Type motion:** the portfolio's title pop-in (every `h1` in `.pm-page`), a figure pop-in (automatic on every `.pm-stat-bar`, or `pmShell.numPop` for other figures) and glow-tinted stat and step numbers (`<body data-color-slots>` with `data-color-slot` on the figures), plus `pmShell.mixColor` for page scripts.
- **Logos:** `dist/logos.svg`, a sprite of the footer's tool logos (`pm-logo-figma`, `-claude`, `-github`, `-vercel`, `-human`).
- **Package exports:** `components.css`, `shell.css`, `shell.js`, `icons.svg` and `logos.svg` are now exported, so a bundled app can import them by version instead of keeping a copy. Package version is 0.5.0 (it had stayed at 0.1.0).
- **Storybook:** a Shell section with the header (desktop and phone), the compact header, the open mobile menu, the footer and the backdrop. Storybook's own frame and docs pages now use the design system: IBM Plex type, the surface, text, border and accent tokens (read from `dist/tokens.resolved.json`), display-face headings, and "Alex Grinyayev · Design System" in the sidebar. The frame, docs and previews open in the visitor's system theme; the toolbar switch still flips the previews.

## v0.4.0 (2026-10-18)

- **Disabled buttons and interactive pills are inert:** `pointer-events: none`, so no hover shadow, colour change or lift, and no transition. Previously a disabled primary button still picked up the hover shadow and a disabled ghost button changed border and text colour on hover. The not-allowed cursor is gone with it, since an inert element no longer reports a cursor.
- **Light theme:** set `data-theme="light"` on `<html>` and the semantic color and shadow tokens switch to a light set (cool blue-gray surfaces, ink text). Dark stays the default; nothing follows the operating system setting by itself, so each product decides when to opt in. Accent colors, the brand gradient, type, spacing and motion are shared by both themes. Coral text uses `color.text.accent` and cyan text uses the new `color.text.accent-secondary` (both darker in light), because the vivid colors are only about 2.9:1 and 1.6:1 on a light page. Use `color.focus.ring` for focus outlines.
- **Icons:** `sun` and `moon`, for a theme switch (14 icons in total).
- **Validation:** the contrast gates now run for every theme, and a theme may only override existing semantic tokens of the same type.
- **Build:** `tokens/light.tokens.json` is a mode file; `dist/tokens.css` gets a `:root[data-theme="light"]` block and `dist/tokens.resolved.json` gets a `$modes` section. 28 new primitives (light neutrals, darker accent steps, ink and tinted alphas).
- **Storybook:** a Theme switch in the toolbar, and IBM Plex Sans and IBM Plex Serif now load from Google Fonts (previously Storybook showed fallback fonts).

## v0.3.0 (2026-10-18)

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
- **v0.3.0 (released):** display font changes to IBM Plex Serif.
- **v0.4.0 (released):** light theme (`data-theme="light"`), sun and moon icons, theme switch in Storybook, inert disabled buttons and pills.
- **v0.5.0:** form controls (text input, textarea, select, checkbox, radio, toggle, form field with label, hint and error) and feedback (status badge, banner, inline message).
- **v0.6.0:** tabs, table and accordion.
- **Later, only when a product needs them:** modal, tooltip, progress and loading, breadcrumbs, pagination.
- **Not planned:** date picker, tree view, file upload, data-table features.

## v0.1.0

- Design tokens in the W3C design-token format (primitives, semantic roles, component values), built to `dist/tokens.css`, `dist/legacy-aliases.css` and `dist/tokens.resolved.json`, with a validator that enforces structure, tier direction and WCAG 2.2 contrast.
