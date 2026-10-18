// Builds an inline <svg> for an icon in icons/ (via dist/icons.json), so stories use the same drawings as the sprite.
import icons from '../dist/icons.json';

export const iconNames = Object.keys(icons);

export function icon(name, cls = 'pm-icon', extra = ' aria-hidden="true"') {
  const i = icons[name];
  if (!i) throw new Error(`No icon named "${name}" in icons/`);
  return `<svg class="${cls}" ${i.attrs}${extra}>${i.inner}</svg>`;
}
