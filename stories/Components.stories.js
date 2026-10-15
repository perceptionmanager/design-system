// Shared components (v0.2.0). One story per component; each shows every state.
// data-state mirrors :hover / :focus-visible so the states can be shown side by side.
export default {
  title: 'Components/All',
  parameters: { layout: 'padded' },
};

const wrap = (inner, surface = 'page') =>
  `<div style="background:var(--pm-color-surface-${surface});padding:var(--pm-space-8);display:flex;flex-direction:column;gap:var(--pm-space-8);font-family:var(--pm-font-family-sans)">${inner}</div>`;
const row = (label, inner) =>
  `<div><div style="font-size:var(--pm-type-caption-size);color:var(--pm-color-text-tertiary);margin-bottom:var(--pm-space-3)">${label}</div><div style="display:flex;gap:var(--pm-space-6);align-items:center;flex-wrap:wrap">${inner}</div></div>`;

const states = (cls, text) =>
  [['Default', ''], ['Hover', ' data-state="hover"'], ['Focus', ' data-state="focus"'], ['Disabled', ' disabled']]
    .map(([n, a]) => `<div style="display:flex;flex-direction:column;gap:var(--pm-space-2);align-items:flex-start"><button type="button" class="pm-btn ${cls}"${a}>${text}</button><span style="font-size:var(--pm-type-caption-size);color:var(--pm-color-text-tertiary)">${n}</span></div>`)
    .join('');

export const Buttons = {
  render: () => wrap(
    row('Primary', states('pm-btn--primary', 'Primary')) +
    row('Ghost', states('pm-btn--ghost', 'Ghost')) +
    row('Tertiary (36px tall, 8px padding)', states('pm-btn--tertiary', 'Tertiary')),
  ),
};

export const Card = {
  render: () => wrap(`<article class="pm-card" style="max-width:360px"><h3 style="margin:0 0 var(--pm-space-2);font:var(--pm-type-heading-sm-weight) var(--pm-type-heading-sm-size)/var(--pm-type-heading-sm-line-height) var(--pm-type-heading-sm-family)">Card</h3><p style="margin:0;color:var(--pm-color-text-secondary)">24px padding, card surface, subtle border.</p></article>`),
};

export const PillAndTag = {
  name: 'Pill and Tag',
  render: () => wrap(
    row('Pill', '<span class="pm-pill"><span class="pm-pill__dot"></span>Live</span>') +
    row('Tag', '<span class="pm-tag">Tokens</span><span class="pm-tag">WCAG 2.2</span>'),
  ),
};

export const Stat = {
  render: () => wrap(`<div style="display:flex;gap:var(--pm-space-12)"><div class="pm-stat"><span class="pm-stat__value">207</span><span class="pm-stat__label">Design tokens</span></div><div class="pm-stat"><span class="pm-stat__value">31 → 10</span><span class="pm-stat__label">Type sizes</span></div></div>`, 'card'),
};

export const Step = {
  render: () => wrap(`<div style="max-width:480px">${[['1', 'Audit what exists', 'Count what the products use.'], ['2', 'Define tokens in layers', 'Primitives, semantic, component.'], ['3', 'Build and validate', 'One CSS file, contrast checked.']]
    .map(([n, t, b]) => `<div class="pm-step"><div class="pm-step__line"></div><div class="pm-step__num">${n}</div><div><h3 class="pm-step__title">${t}</h3><p class="pm-step__body">${b}</p></div></div>`).join('')}</div>`),
};

export const CheckItem = {
  name: 'Check item',
  render: () => wrap(`<div style="max-width:480px">${['A border never changes a button’s height.', '44px minimum touch targets.']
    .map((t) => `<div class="pm-check-row"><div class="pm-check" aria-hidden="true">✓</div><p>${t}</p></div>`).join('')}</div>`),
};
