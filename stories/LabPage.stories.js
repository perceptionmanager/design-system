// A Lab tool page assembled from the design system only: shell, page layout, form fields, feedback and modal.
// It is the integration check for v0.6.0: if a product needs a rule that isn't here, it belongs in the design system.
import '../dist/shell.css';
import { icon } from './icon.js';

export default {
  title: 'Shell/Lab page',
  parameters: { layout: 'fullscreen' },
};

const words = (t) => t.split(' ').map((w, i) => `<span class="pm-split-word" style="animation-delay:${(0.05 + i * 0.07).toFixed(2)}s">${w}</span>`).join(' ');

export const LabPage = {
  name: 'Lab page',
  render: () => `<div class="pm-page" style="min-height:100vh">
  <header class="pm-site-header" style="position:relative">
    <div class="pm-site-header__inner">
      <div class="pm-site-header__brand"><span class="pm-site-header__name">Alex Grinyayev</span>
        <a class="pm-site-header__cred" href="#"><span class="pm-site-header__badge-label"><span class="pm-site-header__badge-prefix">NNg Certified - </span>ID 1064178</span></a></div>
      <a class="pm-btn pm-btn--ghost pm-site-header__cta" href="#">${icon('mail')}<span class="pm-site-header__cta-label">Let's connect</span></a>
      <button class="pm-btn pm-btn--ghost pm-btn--icon-only pm-theme-toggle" type="button" aria-label="Switch theme">${icon('sun', 'pm-icon pm-theme-toggle__sun')}${icon('moon', 'pm-icon pm-theme-toggle__moon')}</button>
    </div><div class="pm-site-header__rule"></div>
  </header>
  <main>
    <section class="pm-hero pm-wrap">
      <p class="pm-pill pm-fade-in" style="animation-delay:.05s"><span class="pm-pill__dot" aria-hidden="true"></span>Role fit analysis</p>
      <h1>${words('Score a role against my background.')}</h1>
      <p class="pm-hero__sub pm-fade-in" style="animation-delay:.25s">Paste a job description to get a match score, the gaps a hiring manager would see, and the stories to lead with.</p>
    </section>
    <div class="pm-wrap pm-section--stats pm-fade-in" style="animation-delay:.35s">
      <div class="pm-stat-bar">
        <div class="pm-stat"><b class="pm-stat__value">0–100</b><span class="pm-stat__label">Match score with the reasoning behind it</span></div>
        <div class="pm-stat"><b class="pm-stat__value">8</b><span class="pm-stat__label">Sections in every report</span></div>
        <div class="pm-stat"><b class="pm-stat__value">10–20s</b><span class="pm-stat__label">Typical time for one analysis</span></div>
      </div>
    </div>
    <section class="pm-wrap pm-section">
      <h2>Analyze a role</h2>
      <p class="pm-section__desc">Paste the full posting. Set a salary range and work arrangement to check the role against.</p>
      <div class="pm-card" style="margin-top:var(--pm-space-8);padding:var(--pm-space-8);display:flex;flex-direction:column;gap:var(--pm-space-5)">
        <div class="pm-field"><label class="pm-field__label" for="lp-jd">Job description</label><textarea class="pm-textarea pm-textarea--code" id="lp-jd" placeholder="Paste the full job description here"></textarea></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--pm-space-4)">
          <div class="pm-field"><label class="pm-field__label" for="lp-min">Salary min ($) <span class="pm-field__optional">(optional)</span></label><input class="pm-input" id="lp-min" type="number" step="5000"></div>
          <div class="pm-field"><label class="pm-field__label" for="lp-max">Salary max ($) <span class="pm-field__optional">(optional)</span></label><input class="pm-input" id="lp-max" type="number" step="5000"></div>
          <div class="pm-field"><label class="pm-field__label" for="lp-arr">Arrangement</label><div class="pm-select"><select id="lp-arr"><option>Flexible</option><option>Remote preferred</option></select></div></div>
        </div>
        <div><button class="pm-btn pm-btn--primary" type="button" aria-busy="true"><span class="pm-spinner" aria-hidden="true"></span>Analyzing…</button></div>
      </div>
      <div class="pm-alert pm-alert--error" role="alert" style="margin-top:var(--pm-space-4)"><p>Paste a job description first.</p></div>
      <div style="display:flex;align-items:center;gap:var(--pm-space-5);margin-top:var(--pm-space-8)">
        <span style="font:var(--pm-type-display-md-weight) var(--pm-type-display-md-size)/1 var(--pm-type-display-md-family)">82</span>
        <div class="pm-meter" data-level="strong" role="meter" aria-valuenow="82" aria-valuemin="0" aria-valuemax="100" aria-label="Match score" style="flex:1"><div class="pm-meter__fill" style="width:82%"></div></div>
      </div>
      <div style="display:flex;gap:var(--pm-space-2);flex-wrap:wrap;margin-top:var(--pm-space-4)"><span class="pm-badge pm-badge--accent pm-badge--lg">Healthcare claims experience</span><span class="pm-badge pm-badge--high">HIGH</span></div>
    </section>
    <section class="pm-wrap pm-split">
      <h2>How it works</h2>
      <div><p class="pm-split__intro">A serverless function sends the posting and my profile to Claude, and the page renders the structured result.</p>
      <p class="pm-split__note">Nothing you paste is stored.</p></div>
    </section>
  </main>
</div>`,
};
