// Validates tokens/*.tokens.json: DTCG structure, references, tier direction, and WCAG contrast gates.
// Exits non-zero on any failure so it can gate CI and pull requests.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTokens, refsIn, resolve, contrast, fmt } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
let tokens;
try { tokens = loadTokens(join(root, 'tokens')); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }

const TYPES = new Set(['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography']);
const RANK = { primitives: 0, semantic: 1, components: 2 };

for (const [path, t] of tokens) {
  for (const seg of path.split('.')) if (/[{}.]/.test(seg) || seg.startsWith('$')) errors.push(`${path}: invalid name segment "${seg}"`);
  if (!TYPES.has(t.$type)) errors.push(`${path}: unknown or missing $type "${t.$type}"`);

  for (const r of refsIn(t.$value)) {
    const target = tokens.get(r);
    if (!target) { errors.push(`${path}: unresolved reference {${r}}`); continue; }
    if (RANK[target.tier] > RANK[t.tier]) errors.push(`${path} (${t.tier}) must not reference higher-tier token {${r}} (${target.tier})`);
    if (typeof t.$value === 'string' && target.$type !== t.$type) errors.push(`${path}: alias of {${r}} changes type ${target.$type} → ${t.$type}`);
  }
  if (t.tier === 'primitives' && refsIn(t.$value).length) errors.push(`${path}: primitives hold raw values only`);

  let v;
  try { v = resolve(tokens, t.$value); } catch (e) { errors.push(`${path}: ${e.message}`); continue; }
  if (t.$type === 'color') {
    if (v.colorSpace !== 'srgb' || v.components?.length !== 3 || v.components.some((c) => c < 0 || c > 1)) errors.push(`${path}: color must be sRGB with 3 components in 0–1`);
    if (v.alpha !== undefined && (v.alpha < 0 || v.alpha > 1)) errors.push(`${path}: alpha out of range`);
  }
  if (t.$type === 'dimension' && !['px', 'rem'].includes(v.unit)) errors.push(`${path}: dimension unit must be px or rem`);
  if (t.$type === 'duration' && !['ms', 's'].includes(v.unit)) errors.push(`${path}: duration unit must be ms or s`);
}

// ---- WCAG 2.2 contrast gates (opaque colors only)
const c = (p) => resolve(tokens, `{${p}}`);
const gates = [];
const SURFACES = ['color.surface.page', 'color.surface.raised', 'color.surface.card'];
for (const text of ['color.text.primary', 'color.text.secondary', 'color.text.tertiary', 'color.text.accent', 'color.text.interactive-hover', 'color.status.success', 'color.status.critical', 'color.status.high', 'color.status.medium', 'color.status.low', 'color.status.error', 'color.status.warning']) {
  for (const s of SURFACES) gates.push([text, s, 4.5, '1.4.3 text']);
}
gates.push(['color.text.on-accent', 'color.accent.primary', 4.5, '1.4.3 text']);
gates.push(['color.text.on-accent', 'color.accent.secondary', 4.5, '1.4.3 text']);
for (const s of SURFACES) gates.push(['color.focus.ring', s, 3, '1.4.11 non-text']);

const report = [];
for (const [fg, bg, min, sc] of gates) {
  if (!tokens.has(fg) || !tokens.has(bg)) { errors.push(`contrast gate references missing token ${fg} / ${bg}`); continue; }
  let ratio;
  try { ratio = contrast(c(fg), c(bg)); } catch (e) { errors.push(`contrast gate ${fg} on ${bg}: ${e.message}`); continue; }
  report.push(`${ratio >= min ? "✓" : "✗"} ${ratio.toFixed(2).padStart(6)}:1  ${fg} on ${bg}  (≥${min}, SC ${sc})`);
  if (ratio < min) errors.push(`contrast ${ratio.toFixed(2)}:1 < ${min}:1 — ${fg} on ${bg}`);
}

console.log(`${tokens.size} tokens checked (${Object.keys(RANK).map((k) => `${[...tokens.values()].filter((t) => t.tier === k).length} ${k}`).join(', ')})`);
console.log(report.join('\n'));
if (errors.length) { console.error(`\n✗ ${errors.length} problem(s):\n  ` + errors.join('\n  ')); process.exit(1); }
console.log('\n✓ All checks passed');
