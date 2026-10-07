# perceptionmanager design system

Shared design tokens for four products: **perceptionmanager.com**, **Role Analyzer**, the **UX Intelligence Engine**, and the **Kiro UX Auditor**. Change a value here once and every product picks it up.

The values come from an audit of the portfolio's CSS (5,936 declarations). The audit is in [`docs/audit/`](docs/audit/audit-report.html), and the decisions it led to are in [`DECISIONS.md`](DECISIONS.md).

## What's here

```
tokens/                    ← source of truth (W3C Design Tokens Format 2025.10)
  primitives.tokens.json     raw values: palette, 4px space scale, radii, type sizes, motion, z-index
  semantic.tokens.json       roles products use: surface, text, border, accent, 10 type roles, shadows, layout
  components.tokens.json     button, card, tag, stat, step, check, nav, focus
dist/                      ← generated, committed so products can load it directly
  tokens.css                 --pm-* custom properties in @layer tokens, reduced-motion rule, .pm-text-* classes
  legacy-aliases.css         old portfolio names (--bg, --ink-dim, …) → tokens, for gradual migration
  tokens.resolved.json       every token fully resolved, for Figma sync and other tools
scripts/                   ← zero-dependency Node build and validator
docs/audit/                ← the audit report and the CSV evidence behind it
integrations/              ← Kiro steering rules to copy into each product repo
```

## Use it in a product

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/perceptionmanager/design-system@main/dist/tokens.css">
<!-- portfolio only, while migrating: -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/perceptionmanager/design-system@main/dist/legacy-aliases.css">
```

For production, pin a release tag instead of `@main` (e.g. `@v0.1.0`) so a token change never reaches a product until you bump the version.

```css
@layer tokens, base, components, product;

.card {
  background: var(--pm-card-bg);
  border: 1px solid var(--pm-card-border);
  border-radius: var(--pm-card-radius);
  padding: var(--pm-card-padding);
}
.card h3 { font: var(--pm-type-heading-sm-weight) var(--pm-type-heading-sm-size)/var(--pm-type-heading-sm-line-height) var(--pm-type-heading-sm-family); }
```

Product CSS uses **semantic and component tokens**, not primitives. Type sizes are fluid: each role scales between its mobile and desktop size for viewports from 375px to 1280px, so you rarely need breakpoint overrides for text.

**Hosting:** the repo is public, so jsDelivr serves `dist/` directly from GitHub. `vercel.json` is also ready if you'd rather host it on Vercel with your own domain.

## Figma

The Figma library mirrors these tokens: [perceptionmanager design system](https://www.figma.com/design/OjKldfSUdETPYRFhlJ2PkU). It has 162 variables (with the CSS variable name as each one's code syntax), 12 text styles, 6 shadow styles, a gradient paint style, and 7 components. Primitives are hidden from pickers, so designers only see roles. Type sizes switch between the Responsive collection's Desktop and Mobile modes.

## Change a token

1. Edit `tokens/*.tokens.json`.
2. `npm run build` validates the tokens and regenerates `dist/`. Commit both.
3. For a foundation change, add a dated entry to `DECISIONS.md`.

`npm run validate` fails if any of these are wrong:
- **Structure:** token names, `$type`, color, dimension and duration value shapes.
- **References:** every `{reference}` resolves, with no cycles and no type changes through an alias.
- **Tier direction:** primitives → semantic → components. A token never references a higher tier.
- **WCAG 2.2 contrast:** every text role on every surface is at least 4.5:1 (SC 1.4.3). Text on accents is at least 4.5:1. The focus ring is at least 3:1 (SC 1.4.11).

CI runs `npm run check` on every push and pull request. It also fails if `dist/` wasn't regenerated.

## Format notes

- Colors use the DTCG 2025.10 object form (`colorSpace`, `components`, `hex`). Dimensions use `{ value, unit }` in px or rem.
- DTCG has no em unit, so letter-spacing is stored as an em multiplier (`$type: number`) and output as `em`.
- Fluid min/max sizes live in `$extensions["com.perceptionmanager.fluid"]`. In Figma they become **Mobile** and **Desktop** variable modes.

## Roadmap

- [x] Audit and approved foundations
- [x] Tokens, build, validation, CI
- [x] Figma library built from these tokens (variables → text styles → components)
- [ ] Shared component CSS (`dist/components.css`) built from the portfolio's per-page copies
- [ ] Migrate perceptionmanager.com, then Role Analyzer, UX Intelligence Engine and Kiro UX Auditor
- [ ] Light mode (deferred — see DECISIONS.md)
