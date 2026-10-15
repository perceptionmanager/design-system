export default {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
};

const panel = (inner) => `
  <div style="padding:24px;border-radius:12px;background:var(--pm-color-surface-page);">
    ${inner}
  </div>`;

const grid = (items) => `
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
    ${items.join('')}
  </div>`;

const label = (name) => `<code style="font-size:14px;color:var(--pm-color-text-primary);word-break:break-all;">${name}</code>`;

const swatch = (name) => `
  <div style="display:flex;flex-direction:column;gap:8px;">
    <div style="height:64px;border-radius:8px;border:1px solid var(--pm-color-text-tertiary);background:var(${name});"></div>
    ${label(name)}
  </div>`;

const textSample = (name) => `
  <div style="display:flex;flex-direction:column;gap:8px;">
    <div style="padding:16px;border-radius:8px;background:var(--pm-color-surface-raised);border:1px solid var(--pm-color-text-tertiary);">
      <span style="font-family:var(--pm-font-family-sans);font-size:24px;font-weight:600;color:var(${name});">Aa Sample text</span>
    </div>
    ${label(name)}
  </div>`;

const surfaces = ['surface-page','surface-raised','surface-card','surface-sunken','surface-tint','surface-tint-strong','surface-scrim','surface-scrim-strong'].map((n) => `--pm-color-${n}`);
const text = ['text-primary','text-secondary','text-tertiary','text-accent','text-interactive-hover'].map((n) => `--pm-color-${n}`);
const accent = ['accent-primary','accent-secondary','accent-primary-subtle','accent-primary-muted','accent-secondary-subtle'].map((n) => `--pm-color-${n}`);
const status = ['success','critical','high','medium','low','error','warning']
  .flatMap((s) => [s, `${s}-subtle`, `${s}-border`])
  .filter((n) => n !== 'success-subtle' && n !== 'success-border')
  .map((n) => `--pm-color-status-${n}`);

export const Surfaces = { render: () => panel(grid(surfaces.map(swatch))) };
export const Text = { render: () => panel(grid(text.map(textSample))) };
export const Accent = { render: () => panel(grid(accent.map(swatch))) };
export const Status = { render: () => panel(grid(status.map(swatch))) };