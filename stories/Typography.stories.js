export default {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
};

const roles = [
  'display-lg', 'display-md', 'heading-lg', 'heading-md', 'heading-sm',
  'lead', 'body-lg', 'body', 'small', 'caption',
];

const row = (r) => `
  <div style="padding:16px 0;border-bottom:1px solid var(--pm-color-text-tertiary);">
    <code style="font-size:14px;color:var(--pm-color-text-secondary);">--pm-type-${r}-*</code>
    <div style="
      font-family:var(--pm-type-${r}-family);
      font-size:var(--pm-type-${r}-size);
      line-height:var(--pm-type-${r}-line-height);
      font-weight:var(--pm-type-${r}-weight);
      letter-spacing:var(--pm-type-${r}-tracking);
      color:var(--pm-color-text-primary);
      margin-top:8px;">
      The quick brown fox jumps over the lazy dog
    </div>
  </div>`;

export const Scale = {
  render: () => `
    <p style="color:var(--pm-color-text-secondary);max-width:60ch;">
      Ten type roles. Each role scales fluidly between its mobile and desktop size
      from 375px to 1280px. Resize the browser to watch the sizes change.
    </p>
    ${roles.map(row).join('')}`,
};
