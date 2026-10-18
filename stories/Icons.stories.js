// Shared icon set. Source: icons/*.svg. Built to dist/icons.svg (sprite) and dist/icons.json.
import { icon, iconNames } from './icon.js';

export default {
  title: 'Foundations/Icons',
  parameters: { layout: 'padded' },
};

const panel = (inner) => `<div style="background:var(--pm-color-surface-page);padding:var(--pm-space-8);font-family:var(--pm-font-family-sans);color:var(--pm-color-text-primary)">${inner}</div>`;

export const Gallery = {
  render: () => panel(`
    <p style="margin:0 0 var(--pm-space-6);max-width:60ch;color:var(--pm-color-text-secondary)">
      ${iconNames.length} icons on a 24px grid, drawn with a 2px stroke in the current text colour. Use one by name from the sprite:
      <code style="color:var(--pm-color-text-primary)">&lt;svg class="pm-icon" aria-hidden="true"&gt;&lt;use href="icons.svg#pm-icon-mail"/&gt;&lt;/svg&gt;</code>
    </p>
    <ul style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:var(--pm-space-4)">
      ${iconNames.map((n) => `
        <li class="pm-card" style="display:flex;flex-direction:column;align-items:center;gap:var(--pm-space-3);padding:var(--pm-space-5)">
          <span style="font-size:var(--pm-space-8);display:flex">${icon(n)}</span>
          <code style="font-size:var(--pm-type-small-size);color:var(--pm-color-text-secondary)">${n}</code>
        </li>`).join('')}
    </ul>`),
};

export const Sizes = {
  render: () => panel(`
    <p style="margin:0 0 var(--pm-space-4);color:var(--pm-color-text-secondary)">An icon is 1em tall, so it follows the text size around it. The portfolio uses 14, 16 and 18px.</p>
    <div style="display:flex;align-items:center;gap:var(--pm-space-8)">
      ${[14, 16, 18, 24, 32].map((px) => `<div style="display:flex;flex-direction:column;align-items:center;gap:var(--pm-space-2)"><span style="font-size:${px}px;display:flex">${icon('arrow-right')}</span><span style="font-size:var(--pm-type-caption-size);color:var(--pm-color-text-tertiary)">${px}px</span></div>`).join('')}
    </div>`),
};
