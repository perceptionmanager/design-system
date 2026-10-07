// Shared helpers: load the DTCG token files, flatten them, resolve references.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const ROOT_PX = 16;
export const TIERS = ['primitives', 'semantic', 'components']; // load order = tier order

export function loadTokens(dir) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.tokens.json'));
  const ordered = TIERS.map((t) => `${t}.tokens.json`).filter((f) => files.includes(f));
  const extra = files.filter((f) => !ordered.includes(f)).sort();
  const tokens = new Map(); // path -> { $value, $type, $description?, $extensions?, tier, file }
  for (const file of [...ordered, ...extra]) {
    const tree = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    flatten(tree, [], undefined, file.replace('.tokens.json', ''), file, tokens);
  }
  return tokens;
}

function flatten(node, path, inheritedType, tier, file, out) {
  const type = node.$type ?? inheritedType;
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    const p = [...path, key];
    if (value && typeof value === 'object' && '$value' in value) {
      const id = p.join('.');
      if (out.has(id)) throw new Error(`Duplicate token "${id}" in ${file} (already defined in ${out.get(id).file})`);
      out.set(id, { ...value, $type: value.$type ?? type, tier, file });
    } else if (value && typeof value === 'object') {
      flatten(value, p, type, tier, file, out);
    }
  }
}

export const isRef = (v) => typeof v === 'string' && /^\{[^{}]+\}$/.test(v);
export const refPath = (v) => v.slice(1, -1);

/** Collect every {reference} inside a value (strings, objects, arrays). */
export function refsIn(value) {
  if (isRef(value)) return [refPath(value)];
  if (Array.isArray(value)) return value.flatMap(refsIn);
  if (value && typeof value === 'object') return Object.values(value).flatMap(refsIn);
  return [];
}

/** Fully resolve a value, following references (with cycle detection). */
export function resolve(tokens, value, seen = new Set()) {
  if (isRef(value)) {
    const p = refPath(value);
    if (seen.has(p)) throw new Error(`Reference cycle at {${p}}`);
    const t = tokens.get(p);
    if (!t) throw new Error(`Unresolved reference {${p}}`);
    return resolve(tokens, t.$value, new Set([...seen, p]));
  }
  if (Array.isArray(value)) return value.map((v) => resolve(tokens, v, seen));
  if (value && typeof value === 'object' && !('colorSpace' in value) && !('unit' in value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(tokens, v, seen)]));
  }
  return value;
}

export const cssVar = (path) => `--pm-${path.replaceAll('.', '-')}`;
export const fmt = (n) => {
  const s = Number(n).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
};
export const toPx = (d) => (d.unit === 'rem' ? d.value * ROOT_PX : d.value);

/** clamp() that scales linearly between two viewport widths. */
export function fluid(minPx, maxPx, vpMin, vpMax) {
  if (minPx === maxPx) return `${fmt(minPx / ROOT_PX)}rem`;
  const slope = (maxPx - minPx) / (vpMax - vpMin);
  const intercept = minPx - slope * vpMin;
  return `clamp(${fmt(minPx / ROOT_PX)}rem, ${fmt(intercept / ROOT_PX)}rem + ${fmt(slope * 100)}vw, ${fmt(maxPx / ROOT_PX)}rem)`;
}

/** WCAG 2.x relative luminance / contrast for opaque sRGB colors. */
export function luminance({ components }) {
  const f = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = components.map(f);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
