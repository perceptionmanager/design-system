# Decision log

## 2026-10-07: Foundations approved
Based on the audit in `docs/audit/` (5,936 declarations from perceptionmanager.com).

1. **Rounding:** values exactly between two steps round up (spacing 14→16, 18→20; type 13→14, 15→16). Airy is intended.
2. **Hero heading:** one size for every inner page, `typography.display-md` (60px desktop / 36px mobile). Home uses `display-lg` (76 / 42px).
3. **Check icons:** solid coral (`color.accent.primary`) everywhere. The gradient is reserved for primary buttons.
4. **Tertiary text:** `#7A8290` → `#8B93A1` (`color.neutral.500`). Meets WCAG AA on page, raised and card surfaces. `npm run validate` enforces this.
5. **Minimum text size:** 12px (`typography.caption`).
6. **Theme:** dark only. Light mode is deferred for a later discussion. The semantic tier is built so it can be added as a second mode without component changes.

Also adopted as proposed: 4px spacing scale, 6 radii, 10 type roles that scale between 375px and 1280px viewports, the `--pm-` namespace, `@layer tokens`, DTCG 2025.10 as the source format, and reduced-motion support.

## 2026-10-07: Component tokens corrected to match source CSS
Found while building the Figma library: four component tokens in the approved proposal didn't match the portfolio CSS. The code wins.
- `step.num-size`: space.10 (40px) → **space.12 (48px)**, matching `.step-num` (48px).
- `card.padding`: space.8 (32px) → **space.6 (24px)**, matching `.card` (24px).
- `tag.bg`: surface.tint (white 3%) → **surface.tint-strong (white 6%)**, matching `.cs-tag`.
- `tag.text`: text.secondary → **text.tertiary**, matching `.cs-tag` (`--ink-faint`).

## 2026-10-18: Figma library synced to v0.4.0
Reason: the library still described v0.1 (dark only, Fraunces display font), so designers would have seen values the code no longer uses.
- **Light mode:** the Color collection has a second mode, Light, with all 43 semantic roles aliased to primitives exactly as `tokens/light.tokens.json` does. Foundations shows both modes.
- **Display font:** the `font/family/display` variable and the five Display and Heading text styles now use IBM Plex Serif instead of Fraunces (changed in v0.3.0).
- **New variables:** 28 primitives (the light-theme neutrals, 700-weight accents and ink and tinted alpha values) and `color/text/accent-secondary`. 218 variables in total, up from 189.
- **Not in Figma:** shadows and glows are effect styles, which Figma cannot switch by mode, so they keep the dark values. Components were not rebuilt; they bind to the variables, so they follow the mode set on a frame.

## 2026-10-07: Figma library v0.1
File: https://www.figma.com/design/OjKldfSUdETPYRFhlJ2PkU
- 160 variables in 5 collections: Primitives (hidden from pickers), Color (Dark), Dimension, Responsive (Desktop/Mobile), Component. Every variable's WEB code syntax is its `var(--pm-*)` name.
- Not represented as variables (no Figma type): easing curves, the gradient (a paint style instead), shadows (effect styles instead), and the typography composites (text styles instead).
- 12 text styles: the 10 roles plus `Label/button` and `Label/tag`. The two extra styles combine existing tokens only (no new values), for the button and tag components.
- Components: Button (Primary/Ghost/Tertiary × Default/Hover/Focus), Pill, Tag, Card, Stat, Step, Check item.
- Known Figma limits: the focus ring has no 2px offset (Figma strokes can't offset), and hover lift / press scale are code-only motion.

## 2026-10-07: Tertiary button padding
Changed in Figma by Alex: the Tertiary button looked wrong with the portfolio's 8px/2px padding. Tertiary now uses **8px on all sides**.
- New tokens: `button.tertiary-padding-y` and `button.tertiary-padding-x`, both `{space.2}`, mirrored as Figma variables bound to the Tertiary variants.
- The Tertiary button is 36px tall. That passes WCAG 2.2 SC 2.5.8 (24px minimum) but is below the system's 44px comfortable target, which is acceptable for low-emphasis inline navigation.
- The portfolio picks this up when it migrates to the tokens; today's `.btn-tertiary { padding: 8px 2px }` gets replaced.

## 2026-10-07: Buttons are one height regardless of border
In Figma the Ghost button was 54px and the others 52px: its 1px border counted toward its size. The live site has the same 2px mismatch (`.btn-ghost` adds `border: 1px` and `.btn` has none).
- **Figma:** borders on every Button variant are now excluded from layout, so Primary and Ghost are both 52px. Tertiary is 36px.
- **Code (applies when the shared button CSS is written):** a border must not change a button's size. Give every button `border: 1px solid transparent` and subtract 1px from its padding, or draw the Ghost outline with `box-shadow: inset 0 0 0 1px var(--pm-button-ghost-border)`. Either way, Primary and Ghost render at the same height. If you use the transparent border, also set `background-origin: border-box` **after** any `background` shorthand. Otherwise the gradient repeats into the 1px border and shows the wrong color on the edges (seen on the Kiro UX Auditor, fixed 2026-10-07).

## 2026-10-07: Status and severity colors
Needed by the Kiro UX Auditor (audit severity) and useful for any product that shows errors or warnings. Coral is the brand accent, so it is not used for severity.
- New primitives: `rose.400` #FB7185, `orange.400` #FB923C, `amber.300` #FCD34D, plus 12% and 35% alpha versions of each.
- New semantic roles under `color.status`: `critical`, `high`, `medium`, `low`, `error` (same hue as critical) and `warning` (same hue as medium). Each has `-subtle` (badge background) and `-border` variants.
- All pass WCAG AA on every surface, and on their own 12% tint over a card (lowest: critical 4.83:1). `npm run validate` now checks them.
- Severity is never shown by color alone: badges always carry the text label (SC 1.4.1).

## 2026-10-14: Storybook for documentation and component states
Added Storybook (HTML + Vite) with Foundations stories for colors and typography. Live at https://storybook.perceptionmanager.com.
- **Why now:** the tokens are validated and stable, and v0.2.0 will add shared components that need a place to show every state (default, hover, focus, disabled, error). Documenting tokens first gave the setup something real to render.
- **Cost:** Storybook is a devDependency only. `npm run build` and `dist/` remain zero-dependency. A `package-lock.json` is now committed because Vercel installs from it.
- **Scripts:** `storybook` and `build-storybook` run `npm run build` first, so the docs always render the current tokens.
- **Accessibility:** the a11y addon (axe) is on. It checks rendered stories; the validator still owns token contrast.
- **Deployment:** Vercel builds with `npm run build-storybook` and publishes `storybook-static`. The dashboard overrides did not apply to the first builds, so the settings are in `vercel.json`, which also keeps the original `/dist/` CORS and cache headers.
- **Left out:** Vitest, Chromatic and Playwright were added by the installer and removed. Visual regression can come back when components exist.
- **Scope:** this is my own design system across my own products. It is not evidence of organizational adoption.
## 2026-10-15: Shared component CSS (v0.2.0, draft)
Source is `components/components.css`; `npm run build` copies it to `dist/components.css`. Classes are namespaced `.pm-*` so they can sit beside the portfolio's `.btn`, `.card` and so on while it migrates.
- Covers button (primary, ghost, tertiary), card, pill, tag, stat, step and check item. Header and footer are left out: they are page structure, and the Figma library has no component for them yet.
- Uses semantic and component tokens only. A border never changes a button's height: Primary and Ghost render at 52px, Tertiary at 36px (no border, 8px padding).
- `[data-state="hover|focus"]` mirrors the pseudo-classes so Storybook can show every state; products never need it.
- Storybook has one story per component with default, hover, focus and disabled where they apply.

## 2026-10-15: Governance: contribution path, versioning and deprecation (draft)
Added `CONTRIBUTING.md` and `CHANGELOG.md`. The system serves four products, so a change needs a documented path rather than memory.
- Changes go through a branch and a pull request; `npm run check` is the gate, and CI runs it.
- A new component must meet a written checklist (tokens only, every state in Storybook, touch target, contrast, focus, mobile behavior, reduced motion).
- Releases are tags and products pin them. Pre-1.0, minor versions may be breaking, and each one is marked in the changelog.
- Anything removed is deprecated for at least one minor release first.
- The changelog marks component CSS as unreleased until its responsive rules exist (see the migration work).

## 2026-10-18: Check icon stays 24px; selected pill uses color only
- **Check icon:** the `check` size token stays at 24px. Portfolio checks are 28px on desktop today, so the migration makes them 4px smaller. This is an intended change, not a regression.
- **Selected pill:** no check mark. The selected state is exposed through `aria-pressed` / `aria-selected`, and the color change is covered by the contrast gate.

## 2026-10-18: Card gets a gradient accent variant
The portfolio migration found a custom card (patient-portal scenarios) with a 3px brand-gradient bar on top, which the solid 2px accent bars could not cover.
- **Variant:** `pm-card--accent-gradient` draws the bar as a background layer inside the border, so it never changes the card's size.
- **Why 3px, not 2px:** it matches the existing portfolio card, so the migration changes nothing visually. Whether all accent bars should share one thickness is open.

## 2026-10-18: Display font is IBM Plex Serif (was Fraunces)
Decided by Alex while previewing a light theme for the portfolio. The warm serif and sans pairing read as a generic, generated look, in both themes.
- `font.family.display`: Fraunces, Iowan Old Style, Georgia, serif → **IBM Plex Serif, Georgia, serif**. Body text stays IBM Plex Sans, so the system now uses one type family.
- Every heading, stat value and step number changes face. Products need the font loaded: IBM Plex Serif 400, 500 and 600 (and 400 italic if used).
- Figma text styles still use Fraunces and need the same change.
- The chromatic red and cyan text fringe on page titles was removed from the portfolio at the same time. It was page markup, not part of the system, so nothing changes in the tokens for it.

## 2026-10-18: Light theme
Alex asked for a dark and light switch on the portfolio. This reverses the 2026-10-07 "dark only" decision (item 6) now that a second mode is needed; the semantic tier was built for it.
- **Mechanism:** `<html data-theme="light">` overrides semantic tokens. Dark remains the default and the only mode if the attribute is absent, so products that do not opt in see no change. The system does not read `prefers-color-scheme`; each product decides (the portfolio will follow the visitor's setting and remember their choice).
- **Palette:** cool blue-gray surfaces (`#f1f4f9` page, white cards), not a warm cream. A warm cream with serif type and a terracotta accent reads as generic generated design. Text keeps the cool ink from the dark theme.
- **Accents:** the vivid coral and cyan stay as fills, lines and the gradient. Coral text uses `color.text.accent`, which is `coral.700` (`#c43a1c`) in light. Complementing the whole palette (rotating every hue 180 degrees) was tried and rejected: the complement of the dark coral is a light teal with 2.55:1 contrast, and it dropped the signature coral.
- **Contrast:** `npm run validate` now checks every text role, the focus ring and `on-accent` against the three surfaces in both themes. It caught `orange.700` at 4.45:1 on the light page, so it was darkened to `#ad4d08` (4.96:1).
- **Shadows:** black shadows become low-opacity ink shadows; the coral glow under the primary button is a darker coral at 45 to 55% alpha.
- **Not in the tokens:** the portfolio's decorative backdrop (blobs, engraved lines, grain) is site-specific and handled in the portfolio.
- **Figma:** the library needs a "Color (Light)" mode to match. Not done yet.


## 2026-10-18: Disabled controls are inert
A disabled button or interactive pill takes no pointer events. Reason: hover rules for the primary and ghost buttons had equal specificity to the disabled rule and came later, so a disabled button still showed hover styling, which reads as clickable. Keyboard focus is unchanged for `aria-disabled` buttons, which stay focusable.
