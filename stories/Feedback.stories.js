// Feedback: status badge, status line, alert, loading indicator and meter.

export default {
  title: 'Components/Feedback',
  parameters: { layout: 'padded' },
};

const wrap = (inner, surface = 'card') =>
  `<div style="background:var(--pm-color-surface-${surface});padding:var(--pm-space-8);display:flex;flex-direction:column;gap:var(--pm-space-10);font-family:var(--pm-font-family-sans);border-radius:var(--pm-radius-lg)">${inner}</div>`;
const row = (label, inner, col = false) =>
  `<div><div style="font-size:var(--pm-type-caption-size);color:var(--pm-color-text-tertiary);margin-bottom:var(--pm-space-3)">${label}</div><div style="display:flex;${col ? 'flex-direction:column;align-items:stretch;max-width:560px' : 'flex-wrap:wrap;align-items:center'};gap:var(--pm-space-4)">${inner}</div></div>`;

export const StatusBadge = {
  name: 'Status badge',
  render: () => ['card', 'raised', 'page'].map((s) => wrap(
    row(`Severity (Kiro UX Auditor findings), on surface.${s}`, ['critical', 'high', 'medium', 'low'].map((t) => `<span class="pm-badge pm-badge--${t}">${t.toUpperCase()}</span>`).join('')) +
    row('Result', '<span class="pm-badge pm-badge--success">Passed</span><span class="pm-badge pm-badge--warning">Review</span><span class="pm-badge pm-badge--error">Failed</span><span class="pm-badge">Neutral</span>') +
    row('Large, for free text (the Role Analyzer\'s skill gaps)', '<span class="pm-badge pm-badge--accent pm-badge--lg">Healthcare claims experience</span><span class="pm-badge pm-badge--accent pm-badge--lg">People management</span>'),
    s)).join('<div style="height:var(--pm-space-6)"></div>'),
};

export const StatusLine = {
  name: 'Status line',
  render: () => wrap(row('data-state', [
    ['success', 'Updated this morning at 6:02.'],
    ['warning', 'Last updated 3 days ago.'],
    ['error', 'The briefing data didn’t load. <a class="pm-link" href="#">Try again</a>'],
    ['loading', 'Loading today’s briefing…'],
    ['none', 'No run yet.'],
  ].map(([s, t]) => `<p class="pm-status" data-state="${s}" role="status"><span class="pm-status__dot" aria-hidden="true"></span><span>${t}</span></p>`).join(''), true)),
};

export const Alert = {
  render: () => wrap(row('Tones', `
    <div class="pm-alert pm-alert--error" role="alert"><p class="pm-alert__title">The analysis didn’t finish.</p><p>The service took too long to answer. Try again in a minute.</p></div>
    <div class="pm-alert pm-alert--warning"><p class="pm-alert__title">Salary range not given</p><p>The report skips the compensation check.</p></div>
    <div class="pm-alert pm-alert--success"><p class="pm-alert__title">Audit complete</p><p>No critical findings.</p></div>
    <div class="pm-alert"><p>12 findings across 7 heuristics. 2 critical, 4 high.</p></div>
    <div class="pm-alert pm-alert--error" role="alert"><p>Paste a job description first.</p></div>`, true) +
    row('Inline, inside running text', `<div class="pm-alert pm-alert--warning pm-alert--inline"><p class="pm-alert__title">If the role is mostly people management</p><p style="color:var(--pm-color-text-secondary)">The score drops by about 15 points, because the posting asks for hands-on design work.</p></div>`, true)),
};

export const Loading = {
  name: 'Loading indicator',
  render: () => wrap(
    row('With text', '<div class="pm-loading" role="status"><span class="pm-spinner" aria-hidden="true"></span>Analyzing — usually 10–20 seconds…</div>') +
    row('In a button (aria-busy)', '<button class="pm-btn pm-btn--primary" type="button" aria-busy="true"><span class="pm-spinner" aria-hidden="true"></span>Auditing…</button><button class="pm-btn pm-btn--ghost" type="button" aria-busy="true"><span class="pm-spinner" aria-hidden="true"></span>Loading…</button>') +
    row('On its own (decorative; pair it with text nearby)', '<span class="pm-spinner" aria-hidden="true"></span>'),
  ),
};

const meter = (v, level, label) => `<div style="display:flex;align-items:center;gap:var(--pm-space-5)">
  <span style="min-width:2.2ch;font:var(--pm-type-display-md-weight) var(--pm-type-heading-lg-size)/1 var(--pm-type-display-md-family);font-variant-numeric:tabular-nums;color:var(--pm-color-text-primary)">${v}</span>
  <div class="pm-meter" data-level="${level}" role="meter" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100" aria-label="${label}" style="flex:1"><div class="pm-meter__fill" style="width:${v}%"></div></div></div>`;

export const Meter = {
  render: () => wrap(row('data-level: strong, moderate, weak', meter(82, 'strong', 'Match score') + meter(61, 'moderate', 'Match score') + meter(34, 'weak', 'Match score'), true)),
};
