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
