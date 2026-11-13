// Form fields: text field, number, text area, dropdown, checkbox and radio. Every state side by side.
// data-state mirrors :hover / :focus-visible so the states can be shown together; products never set it.

export default {
  title: 'Components/Forms',
  parameters: { layout: 'padded' },
};

const wrap = (inner, surface = 'card') =>
  `<div style="background:var(--pm-color-surface-${surface});padding:var(--pm-space-8);display:flex;flex-direction:column;gap:var(--pm-space-10);font-family:var(--pm-font-family-sans);border-radius:var(--pm-radius-lg)">${inner}</div>`;
const caption = (t) => `<div style="font-size:var(--pm-type-caption-size);color:var(--pm-color-text-tertiary);margin-bottom:var(--pm-space-3)">${t}</div>`;
const grid = (label, cells) => `<div>${caption(label)}<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--pm-space-6)">${cells}</div></div>`;

let n = 0;
const field = ({ label, control, help, error, optional, count }) => {
  const id = `f${++n}`;
  const desc = [help && `${id}-help`, error && `${id}-err`].filter(Boolean).join(' ');
  const c = control(id, desc ? ` aria-describedby="${desc}"` : '');
  const lab = `<label class="pm-field__label" for="${id}">${label}${optional ? ' <span class="pm-field__optional">(optional)</span>' : ''}</label>`;
  return `<div class="pm-field">${count ? `<div class="pm-field__head">${lab}${count}</div>` : lab}${c}${help ? `<p class="pm-field__help" id="${id}-help">${help}</p>` : ''}${error ? `<p class="pm-field__error" id="${id}-err">${error}</p>` : ''}</div>`;
};

const STATES = [['Default', ''], ['Hover', ' data-state="hover"'], ['Focus', ' data-state="focus"'], ['Invalid', ' aria-invalid="true"'], ['Disabled', ' disabled']];

export const TextField = {
  name: 'Text field',
  render: () => wrap(
    grid('States', STATES.map(([s, a]) => field({
      label: s,
      control: (id, d) => `<input class="pm-input" id="${id}" type="text" placeholder="Placeholder"${d}${a}>`,
      help: s === 'Invalid' ? null : 'Helper text explains the field.',
      error: s === 'Invalid' ? 'Say what went wrong and how to fix it.' : null,
    })).join('')) +
    grid('Number, and an optional field', field({
      label: 'Salary min ($)', optional: true,
      control: (id, d) => `<input class="pm-input" id="${id}" type="number" step="5000" min="0" placeholder="120000"${d}>`,
    }) + field({
      label: 'Email',
      control: (id, d) => `<input class="pm-input" id="${id}" type="email" autocomplete="email" value="name@example.com"${d}>`,
    })),
  ),
};

export const TextArea = {
  name: 'Text area',
  render: () => wrap(
    grid('Plain', field({
      label: 'Job description',
      control: (id, d) => `<textarea class="pm-textarea" id="${id}" placeholder="Paste the full posting"${d}></textarea>`,
      help: 'Include the responsibilities and requirements.',
    })) +
    grid('Code, with a character count (warning near the limit, error past it)', field({
      label: 'Component code',
      count: '<span class="pm-field__count">1,240 / 20,000</span>',
      control: (id, d) => `<textarea class="pm-textarea pm-textarea--code" id="${id}"${d}>export function Button({ label }) {\n  return &lt;button&gt;{label}&lt;/button&gt;;\n}</textarea>`,
    }) + field({
      label: 'Component code',
      count: '<span class="pm-field__count" data-state="warning">19,400 / 20,000</span>',
      control: (id, d) => `<textarea class="pm-textarea pm-textarea--code" id="${id}"${d}>…</textarea>`,
    }) + field({
      label: 'Component code',
      count: '<span class="pm-field__count" data-state="error">21,050 / 20,000</span>',
      control: (id, d) => `<textarea class="pm-textarea pm-textarea--code" id="${id}" aria-invalid="true"${d}>…</textarea>`,
      error: 'Trim it to 20,000 characters to run the audit.',
    })),
  ),
};

export const Dropdown = {
  render: () => wrap(grid('States', STATES.map(([s, a]) => field({
    label: s,
    control: (id, d) => `<div class="pm-select"><select id="${id}"${d}${a}><option>Flexible</option><option>Remote preferred</option><option>Hybrid OK</option><option>In-person OK</option></select></div>`,
    error: s === 'Invalid' ? 'Choose a work arrangement.' : null,
  })).join(''))),
};

const choice = (type, label, attrs = '', name = 'g') =>
  `<label class="pm-choice"><input class="pm-${type}" type="${type}" name="${name}"${attrs}>${label}</label>`;

export const CheckboxAndRadio = {
  name: 'Checkbox and radio',
  render: () => wrap(
    grid('Checkbox', [
      ['Unchecked', ''], ['Checked', ' checked'], ['Hover', ' data-state="hover"'], ['Focus', ' data-state="focus"'],
      ['Invalid', ' aria-invalid="true"'], ['Disabled', ' disabled'], ['Disabled, checked', ' disabled checked'],
    ].map(([l, a], i) => choice('checkbox', l, a, `c${i}`)).join('') +
      '<label class="pm-choice"><input class="pm-checkbox" type="checkbox" data-indeterminate>Indeterminate (some selected)</label>') +
    grid('Radio', [['Unchecked', ''], ['Checked', ' checked'], ['Hover', ' data-state="hover"'], ['Focus', ' data-state="focus"'], ['Disabled', ' disabled']]
      .map(([l, a], i) => choice('radio', l, a, `r${i}`)).join('')) +
    `<div>${caption('A group: fieldset and legend, so the question is read with each option')}
      <fieldset class="pm-fieldset"><legend class="pm-field__label">Work arrangement</legend>
        ${choice('radio', 'Remote', ' checked', 'arr')}${choice('radio', 'Hybrid', '', 'arr')}${choice('radio', 'In person', '', 'arr')}
      </fieldset></div>`,
  ),
  play: async ({ canvasElement }) => { canvasElement.querySelectorAll('[data-indeterminate]').forEach((el) => { el.indeterminate = true; }); },
};

export const OnEverySurface = {
  name: 'On every surface',
  render: () => ['page', 'raised', 'card'].map((s) => wrap(
    grid(`On surface.${s}`, field({ label: 'Text field', control: (id, d) => `<input class="pm-input" id="${id}" placeholder="Placeholder"${d}>` }) +
      field({ label: 'Dropdown', control: (id, d) => `<div class="pm-select"><select id="${id}"${d}><option>Flexible</option></select></div>` }) +
      `<div>${choice('checkbox', 'Checkbox', '', `s${s}`)}${choice('radio', 'Radio', ' checked', `sr${s}`)}</div>`), s)).join('<div style="height:var(--pm-space-6)"></div>'),
};
