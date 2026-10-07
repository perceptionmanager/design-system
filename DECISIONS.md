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
