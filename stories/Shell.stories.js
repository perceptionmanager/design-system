// Page shell: header, mobile menu and footer, as every product uses them. Markup reference: docs/shell.md.
// The header is fixed on a real page; here it is drawn in place so it sits inside the story frame.
import '../dist/shell.css';
import { icon } from './icon.js';
import logos from '../logos/logos.svg?raw';

export default {
  title: 'Shell/Page shell',
  parameters: { layout: 'fullscreen' },
};

const inPlace = 'position:relative;';
const navLinks = (current) => ['Home', 'Case Studies', 'Lab', 'About Me']
  .map((t) => `<a class="pm-site-nav__link" href="#"${t === current ? ' aria-current="page"' : ''}>${t}</a>`).join('');

const header = (current = 'Lab') => `
<header class="pm-site-header" style="${inPlace}">
  <div class="pm-site-header__inner">
    <div class="pm-site-header__brand">
      <a class="pm-site-header__name" href="#">Alex Grinyayev</a>
      <a class="pm-site-header__cred" href="#"><span class="pm-site-header__badge-label"><span class="pm-site-header__badge-prefix">NNg Certified - </span>ID 1064178</span></a>
    </div>
    <nav class="pm-site-nav" aria-label="Main">${navLinks(current)}
      <a class="pm-btn pm-btn--ghost pm-site-nav__cta" href="#">${icon('linkedin')}Let's connect</a>
    </nav>
    <button class="pm-btn pm-btn--ghost pm-btn--icon-only pm-theme-toggle" type="button" aria-label="Switch theme">${icon('sun', 'pm-icon pm-theme-toggle__sun')}${icon('moon', 'pm-icon pm-theme-toggle__moon')}</button>
    <button class="pm-menu-btn" type="button" aria-label="Open menu"><span class="pm-menu-btn__bar"></span><span class="pm-menu-btn__bar"></span><span class="pm-menu-btn__bar"></span></button>
  </div>
  <div class="pm-site-header__rule"></div>
  <div class="pm-site-header__progress" style="width:40%"></div>
</header>`;

const footer = `
${logos}
<footer class="pm-site-footer">
  <div class="pm-site-footer__inner">
    <span>© Alex Grinyayev · 2026</span>
    <span>Built with <svg class="pm-site-footer__logo" aria-hidden="true"><use href="#pm-logo-figma"/></svg> Figma and <svg class="pm-site-footer__logo" aria-hidden="true"><use href="#pm-logo-claude"/></svg> Claude, source on <svg class="pm-site-footer__logo" aria-hidden="true"><use href="#pm-logo-github"/></svg> GitHub, deployed on <svg class="pm-site-footer__logo" aria-hidden="true"><use href="#pm-logo-vercel"/></svg> Vercel. Validated by <svg class="pm-site-footer__logo pm-site-footer__logo--human" aria-hidden="true"><use href="#pm-logo-human"/></svg> human.</span>
  </div>
</footer>`;

export const Header = {
  render: () => `<div class="pm-page">${header()}<div style="height:var(--pm-space-16)"></div></div>`,
};

export const HeaderOnPhone = {
  name: 'Header on a phone',
  globals: { viewport: { value: 'mobile1' } },
  render: () => `<div class="pm-page" style="max-width:390px">${header()}</div>`,
};

export const CompactHeader = {
  name: 'Compact header (Lab tools)',
  render: () => `<div class="pm-page"><header class="pm-site-header" style="${inPlace}">
  <div class="pm-site-header__inner">
    <div class="pm-site-header__brand">
      <span class="pm-site-header__name">Alex Grinyayev</span>
      <a class="pm-site-header__cred" href="#"><span class="pm-site-header__badge-label"><span class="pm-site-header__badge-prefix">NNg Certified - </span>ID 1064178</span></a>
    </div>
    <a class="pm-btn pm-btn--ghost pm-site-header__cta" href="#">${icon('mail')}<span class="pm-site-header__cta-label">Let's connect</span></a>
    <button class="pm-btn pm-btn--ghost pm-btn--icon-only pm-theme-toggle" type="button" aria-label="Switch theme">${icon('sun', 'pm-icon pm-theme-toggle__sun')}${icon('moon', 'pm-icon pm-theme-toggle__moon')}</button>
  </div>
  <div class="pm-site-header__rule"></div>
</header><div style="height:var(--pm-space-16)"></div></div>`,
};

export const MobileMenu = {
  name: 'Mobile menu (open)',
  render: () => `<div class="pm-page" style="height:560px">
  <div class="pm-site-menu is-open" style="position:absolute">
    <div class="pm-site-menu__bar"><button class="pm-menu-btn pm-menu-btn--close" type="button" aria-label="Close menu">✕</button></div>
    <nav class="pm-site-menu__nav" aria-label="Mobile menu">
      <a href="#">Home</a><a href="#">Case Studies</a><a href="#" aria-current="page">Lab</a><a href="#">About Me</a>
      <a class="pm-site-menu__cta" href="#">${icon('linkedin')}Let's connect</a>
    </nav>
  </div></div>`,
};

export const Footer = {
  render: () => `<div class="pm-page">${footer}</div>`,
};

export const Backdrop = {
  render: () => `<div class="pm-page" style="height:520px">
  <div class="pm-backdrop__grain"></div>
  <div class="pm-backdrop__aura"></div>
  <div class="pm-backdrop__clear" style="width:480px;height:480px;top:-180px;left:-170px"></div>
  <div class="pm-backdrop__blob pm-backdrop__blob--coral" style="width:320px;height:320px;top:-100px;left:-90px"></div>
  <div class="pm-backdrop__blob pm-backdrop__blob--cyan" style="width:420px;height:420px;top:140px;right:-160px"></div>
  ${header('Home')}
</div>`,
};
