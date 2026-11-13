// Storybook's own interface (sidebar, toolbar, docs pages) styled with this design system's tokens, read from
// dist/tokens.resolved.json so it can't drift from the CSS. Dark is the default; light follows the same semantic roles.
import { create } from 'storybook/theming';
import tokens from '../dist/tokens.resolved.json';

const css = (t) => {
  const v = t.value;
  if (v.alpha === undefined || v.alpha === 1) return v.hex;
  const [r, g, b] = v.components.map((c) => Math.round(c * 255));
  return `rgba(${r}, ${g}, ${b}, ${v.alpha})`;
};
const pick = (mode) => (name) => css((mode === 'light' && tokens.$modes.light[name]) || tokens[name]);
const family = (name) => tokens[name].value.map((f) => (/\s/.test(f) && !f.startsWith("'") ? `'${f}'` : f)).join(', ');
const rem = (name) => tokens[name].value.value * 16;

export function pmTheme(mode = 'dark') {
  const c = pick(mode);
  return create({
    base: mode,
    brandTitle: 'Alex Grinyayev · Design System',
    brandUrl: 'https://perceptionmanager.com/lab-design-system.html',
    brandTarget: '_self',

    fontBase: family('font.family.sans'),
    fontCode: "ui-monospace, 'SF Mono', Menlo, monospace",

    colorPrimary: c('color.accent.primary'),
    // selected sidebar items sit on this color with white text, so it is the deep cyan (the light theme's cyan text) in both themes
    colorSecondary: pick('light')('color.text.accent-secondary'),

    appBg: c('color.surface.raised'),
    appContentBg: c('color.surface.page'),
    appPreviewBg: c('color.surface.page'),
    appHoverBg: c('color.surface.tint-strong'),
    appBorderColor: c('color.border.subtle'),
    appBorderRadius: rem('radius.md'),

    textColor: c('color.text.primary'),
    textInverseColor: c('color.surface.page'),
    textMutedColor: c('color.text.tertiary'),

    barBg: c('color.surface.raised'),
    barTextColor: c('color.text.secondary'),
    barSelectedColor: c('color.text.accent'),
    barHoverColor: c('color.text.primary'),

    buttonBg: c('color.surface.card'),
    buttonBorder: c('color.border.strong'),
    booleanBg: c('color.surface.card'),
    booleanSelectedBg: c('color.surface.tint-strong'),
    inputBg: c('color.surface.card'),
    inputBorder: c('color.border.strong'),
    inputTextColor: c('color.text.primary'),
    inputBorderRadius: rem('radius.md') / 2,
  });
}
