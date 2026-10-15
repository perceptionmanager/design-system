# Changelog

Breaking changes are marked **Breaking**. Products pin a tag; see `CONTRIBUTING.md`.

## Unreleased

- Component CSS (`dist/components.css`): button (primary, ghost, tertiary), card, pill, tag, stat, step, check item, with Storybook stories. Merged to `main` but not tagged. Responsive rules are not in it yet, so products should not migrate to it until they are.

## v0.1.0

- Design tokens in the W3C design-token format (primitives, semantic roles, component values), built to `dist/tokens.css`, `dist/legacy-aliases.css` and `dist/tokens.resolved.json`, with a validator that enforces structure, tier direction and WCAG 2.2 contrast.
