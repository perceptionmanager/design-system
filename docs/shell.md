# Page shell

The shell is everything a page shares around its own content: skip link, site header, mobile menu, footer and backdrop. It is the same on the portfolio and every Lab tool, so a change made here reaches all of them.

## Files

| File | What it does |
|---|---|
| `dist/shell.css` | Layout and look of the shell. Load after `tokens.css` and `components.css`. |
| `dist/shell.js` | Menu, theme switch, reading-progress bar, drifting glows, line pattern, magnetic buttons, copy-on-mailto. |
| `dist/icons.svg` | Icon sprite (sun, moon, LinkedIn, mail…). |
| `dist/logos.svg` | Tool logos for the footer (Figma, Claude, GitHub, Vercel, human). |

SVG `<use>` only reads sprites from the page's own origin, so copy `icons.svg` and `logos.svg` into the product and point `<use href>` at the copies. The CSS and JS can load from the CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/perceptionmanager/design-system@v0.5.0/dist/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/perceptionmanager/design-system@v0.5.0/dist/components.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/perceptionmanager/design-system@v0.5.0/dist/shell.css">
<script src="https://cdn.jsdelivr.net/gh/perceptionmanager/design-system@v0.5.0/dist/shell.js" defer></script>
```

In a bundled app (Next.js), import the CSS from the package before any app CSS, so the layer order `tokens, base, components, product` is declared first, and serve `shell.js` from the app's public folder.

## Theme boot script

Put this in `<head>`, before any stylesheet, so the page never flashes the wrong theme. It uses the saved choice, then the visitor's system setting. The theme switch in the header saves the choice under the same key, so it carries across the portfolio and the tools that share a domain.

```html
<script>(function(){var t;try{t=localStorage.getItem('pm-theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark'}document.documentElement.setAttribute('data-theme',t)})();</script>
```

## Markup

Replace `ICONS` and `LOGOS` with the product's copies of the sprites, and `SITE` with the portfolio's address (`https://perceptionmanager.com/` on a tool; nothing on the portfolio itself). Mark the current page with `aria-current="page"` in both navs; the Lab tools mark Lab.

```html
<body>
<a class="pm-skip-link" href="#main">Skip to content</a>
<div class="pm-page">

  <!-- backdrop (optional) -->
  <div class="pm-backdrop__grain"></div>
  <div class="pm-backdrop__aura"></div>
  <div data-blob-group data-blob-role="coral" data-tx-range="90" data-ty-range="85" data-scale-min="0.55" data-scale-max="1.75" data-blur-min="30" data-blur-max="130" data-op-min="0.14" data-op-max="0.62" data-dur-min="4" data-dur-max="8">
    <div class="pm-backdrop__clear" data-blob-target style="width:480px;height:480px;top:-180px;left:-170px"></div>
    <div class="pm-backdrop__blob pm-backdrop__blob--coral" data-blob-target style="width:320px;height:320px;top:-100px;left:-90px"></div>
  </div>
  <div class="pm-backdrop__group--desktop" data-blob-group data-blob-role="cyan" data-tx-range="90" data-ty-range="85" data-scale-min="0.55" data-scale-max="1.7" data-blur-min="30" data-blur-max="130" data-op-min="0.14" data-op-max="0.6" data-dur-min="4.5" data-dur-max="8.5">
    <div class="pm-backdrop__clear" data-blob-target style="width:630px;height:630px;top:35px;right:-265px"></div>
    <div class="pm-backdrop__blob pm-backdrop__blob--cyan" data-blob-target style="width:420px;height:420px;top:140px;right:-160px"></div>
  </div>

  <header class="pm-site-header">
    <div class="pm-site-header__inner">
      <div class="pm-site-header__brand">
        <a class="pm-site-header__name" href="SITE">Alex Grinyayev</a>
        <a class="pm-site-header__cred" href="https://www.nngroup.com/ux-certification/people/" target="_blank" rel="noopener">
          <img class="pm-site-header__badge" src="nng-ux-certified-badge.webp" alt="NN/g UX Certified" width="56" height="53" draggable="false">
          <span class="pm-site-header__badge-label"><span class="pm-site-header__badge-prefix">NNg Certified - </span>ID 1064178</span>
        </a>
      </div>
      <nav class="pm-site-nav" aria-label="Main">
        <a class="pm-site-nav__link" href="SITE">Home</a>
        <a class="pm-site-nav__link" href="SITEcase-studies.html">Case Studies</a>
        <a class="pm-site-nav__link" href="SITElab.html" aria-current="page">Lab</a>
        <a class="pm-site-nav__link" href="SITEabout.html">About Me</a>
        <a class="pm-btn pm-btn--ghost pm-site-nav__cta" data-magnetic href="https://www.linkedin.com/in/userexperiences/" target="_blank" rel="noopener"><svg class="pm-icon" aria-hidden="true" focusable="false"><use href="ICONS#pm-icon-linkedin"/></svg>Let's connect</a>
      </nav>
      <button class="pm-btn pm-btn--ghost pm-btn--icon-only pm-theme-toggle" type="button" aria-label="Switch to light theme" data-theme-toggle><svg class="pm-icon pm-theme-toggle__sun" aria-hidden="true" focusable="false"><use href="ICONS#pm-icon-sun"/></svg><svg class="pm-icon pm-theme-toggle__moon" aria-hidden="true" focusable="false"><use href="ICONS#pm-icon-moon"/></svg></button>
      <button class="pm-menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="siteMenu" data-menu-open><span class="pm-menu-btn__bar"></span><span class="pm-menu-btn__bar"></span><span class="pm-menu-btn__bar"></span></button>
    </div>
    <div class="pm-site-header__rule"></div>
    <div class="pm-site-header__progress" data-scroll-progress></div>
  </header>

  <div class="pm-site-menu" id="siteMenu" data-menu>
    <div class="pm-site-menu__bar">
      <button class="pm-menu-btn pm-menu-btn--close" type="button" aria-label="Close menu" data-menu-close>✕</button>
    </div>
    <nav class="pm-site-menu__nav" aria-label="Mobile menu">
      <a href="SITE">Home</a>
      <a href="SITEcase-studies.html">Case Studies</a>
      <a href="SITElab.html" aria-current="page">Lab</a>
      <a href="SITEabout.html">About Me</a>
      <a class="pm-site-menu__cta" href="https://www.linkedin.com/in/userexperiences/" target="_blank" rel="noopener"><svg class="pm-icon" aria-hidden="true" focusable="false"><use href="ICONS#pm-icon-linkedin"/></svg>Let's connect</a>
    </nav>
  </div>

  <main id="main" tabindex="-1">
    <!-- page content -->
  </main>

  <footer class="pm-site-footer">
    <div class="pm-site-footer__inner">
      <span>© Alex Grinyayev · 2026</span>
      <span>Built with <svg class="pm-site-footer__logo" aria-hidden="true" focusable="false"><use href="LOGOS#pm-logo-claude"/></svg> Claude, source on <svg class="pm-site-footer__logo" aria-hidden="true" focusable="false"><use href="LOGOS#pm-logo-github"/></svg> GitHub, deployed on <svg class="pm-site-footer__logo" aria-hidden="true" focusable="false"><use href="LOGOS#pm-logo-vercel"/></svg> Vercel.</span>
    </div>
  </footer>
</div>
</body>
```

The footer's "Built with" line names what that product was actually built with; the logo sprite covers Figma, Claude, GitHub, Vercel and a human.

## Compact header (Lab tools)

The Lab tools show only the name, the credential, a "Let's connect" button and the theme switch: no nav or menu, and so no mobile menu markup. The name is plain text. The button stays on phones and turns icon-only below 600px; its label stays available to screen readers.

```html
<header class="pm-site-header">
  <div class="pm-site-header__inner">
    <div class="pm-site-header__brand">
      <span class="pm-site-header__name">Alex Grinyayev</span>
      <a class="pm-site-header__cred" href="https://www.nngroup.com/ux-certification/people/" target="_blank" rel="noopener">…badge and label as above…</a>
    </div>
    <a class="pm-btn pm-btn--ghost pm-site-header__cta" data-magnetic href="mailto:perceptionmanager@gmail.com"><svg class="pm-icon" aria-hidden="true" focusable="false"><use href="ICONS#pm-icon-mail"/></svg><span class="pm-site-header__cta-label">Let's connect</span></a>
    <button class="pm-btn pm-btn--ghost pm-btn--icon-only pm-theme-toggle" type="button" aria-label="Switch to light theme" data-theme-toggle>…sun and moon icons as above…</button>
  </div>
  <div class="pm-site-header__rule"></div>
  <div class="pm-site-header__progress" data-scroll-progress></div>
</header>
```

Keep the theme boot script in `<head>`, as on every page.

## Type motion

- **Titles:** every `h1` inside `.pm-page` pops in character by character on load (words stay whole). Nothing to add to the markup; screen readers get the title from `aria-label`.
- **Figures:** `pmShell.numPop(container, '.figure-selector')` pops a row of figures in when it scrolls into view, each a beat after the one before (the portfolio's case-study stat strips use it).
- **Glow-tinted numbers:** add `data-color-slots` to `<body>` and `data-color-slot="stat0"`…`"stat2"` to the stat values and `"step0"`…`"step3"` to the step numbers. Their color then follows the drifting glows (coral to cyan on desktop, coral to text color by depth on phones), fading over 5s. The glow groups need `data-blob-role="coral"` and `"cyan"`. The anchors fit the Lab page layout; for another layout call `pmShell.colorSlots({ desktop: {…}, mobile: {…} })` from a page script instead.

All of it is off with reduced motion, apart from the color, which changes slowly and does not move anything.

## Behavior notes

- **Menu:** the button opens the full-screen menu below 861px; Escape or any link closes it; after Escape, focus returns to the menu button.
- **Theme switch:** flips `data-theme` on `<html>` and saves it as `pm-theme`. A change of the system setting wins over a saved choice.
- **Backdrop:** the glows and the line pattern are decorative and `aria-hidden` by being empty. On a slow screen the line pattern steps down and sets `data-fx="lite"`, which stops the animated noise. Set `<body data-backdrop-lines="off">` on reading pages to keep the glow without the lines.
- **Reduced motion:** the drift, the noise flicker, the aura spin, the nav underline animation and the magnetic buttons all stop.
