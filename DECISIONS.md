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
