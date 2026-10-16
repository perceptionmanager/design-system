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
  render: () => {
    const card = (cls, title, body) => `<article class="pm-card ${cls}" style="width:280px;align-self:stretch"><h3 style="margin:0 0 var(--pm-space-2);font:var(--pm-type-heading-sm-weight) var(--pm-type-heading-sm-size)/var(--pm-type-heading-sm-line-height) var(--pm-type-heading-sm-family)">${title}</h3><p style="margin:0;color:var(--pm-color-text-secondary)">${body}</p></article>`;
    return wrap(row('Card, then with a primary or secondary accent bar on the top edge',
      card('', 'Default', '24px padding, card surface, subtle border.') +
      card('pm-card--accent-primary', 'Primary accent', 'Coral bar along the top edge.') +
      card('pm-card--accent-secondary', 'Secondary accent', 'Cyan bar along the top edge.')));
  },
};

export const PillAndTag = {
  name: 'Pill and Tag',
  render: () => {
    const pill = (label, attrs, count) => `<button type="button" class="pm-pill pm-pill--interactive"${attrs}>${label}${count ? ` <span class="pm-pill__count">${count}</span>` : ''}</button>`;
    const col = (name, html) => `<div style="display:flex;flex-direction:column;gap:var(--pm-space-2);align-items:flex-start">${html}<span style="font-size:var(--pm-type-caption-size);color:var(--pm-color-text-tertiary)">${name}</span></div>`;
    return wrap(
      row('Status pill', '<span class="pm-pill"><span class="pm-pill__dot"></span>Live</span>') +
      row('Interactive pill (filter): default, hover, selected, focus, disabled',
        col('Default', pill('Tooling and AI', ' aria-pressed="false"', 1)) +
        col('Hover', pill('Tooling and AI', ' aria-pressed="false" data-state="hover"', 1)) +
        col('Selected', pill('Product discovery', ' aria-pressed="true"', 1)) +
        col('Focus', pill('Ops and strategy', ' aria-pressed="false" data-state="focus"', 1)) +
        col('Disabled', pill('Archived', ' aria-pressed="false" disabled', 0))) +
      row('Tag', '<span class="pm-tag">Tokens</span><span class="pm-tag">WCAG 2.2</span>'),
    );
  },
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

const ext = '<svg class="pm-link__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

export const Links = {
  render: () => wrap(
    row('Text link: default, hover, focus', `<p style="margin:0;color:var(--pm-color-text-secondary)">Read the <a class="pm-link" href="#">decision log</a>, a <a class="pm-link" href="#" data-state="hover">hovered link</a> and a <a class="pm-link" href="#" data-state="focus">focused link</a>.</p>`) +
    row('External link (opens in a new window)', `<a class="pm-link" href="#" target="_blank" rel="noopener">Storybook${ext}<span class="pm-visually-hidden"> (opens in a new window)</span></a>`) +
    row('Nav link: default, hover, current page, focus', `<a class="pm-nav-link" href="#">Work</a><a class="pm-nav-link" href="#" data-state="hover">Lab</a><a class="pm-nav-link" href="#" aria-current="page">About</a><a class="pm-nav-link" href="#" data-state="focus">Contact</a>`) +
    row('Skip link (shown here in its focused state; off-screen until tabbed to)', `<div style="position:relative;height:72px;width:100%"><a class="pm-skip-link" href="#main" data-state="focus">Skip to main content</a></div>`),
  ),
};
