# design-system — notes for coding agents

- Source of truth is `tokens/*.tokens.json` (W3C DTCG 2025.10). Never edit `dist/` by hand; run `npm run build`.
- Tiers: primitives → semantic → components. A token may only reference its own tier or a lower one; primitives hold raw values. `npm run validate` enforces this and the WCAG contrast gates.
- Every change to tokens must keep `npm run check` green (validation passes and dist is regenerated).
- Record any foundation change in `DECISIONS.md` with the date and reason.
- No runtime dependencies. Scripts are plain Node ≥20 ESM.
