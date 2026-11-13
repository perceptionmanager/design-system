# Feedback

Status badge, status line, alert, loading indicator and meter. All in `dist/components.css`; no JavaScript. Storybook: **Components / Feedback**.

## Status badge

A short label for a level or a result. The word carries the meaning; the color backs it up.

```html
<span class="pm-badge pm-badge--critical">CRITICAL</span>
<span class="pm-badge pm-badge--success">Passed</span>
<span class="pm-badge pm-badge--accent pm-badge--lg">Healthcare claims experience</span>
```

Tones: `--critical`, `--high`, `--medium`, `--low` (or no modifier), `--error`, `--warning`, `--success`, `--accent`. `--lg` is the larger, sentence-case badge for free text.

## Status line

The state of a run or a data source: a dot and one line of text. Give it `role="status"` if it changes while the page is open.

```html
<p class="pm-status" data-state="success" role="status"><span class="pm-status__dot" aria-hidden="true"></span><span>Updated this morning at 6:02.</span></p>
```

`data-state`: `success`, `warning`, `error`, `loading` (the dot pulses, unless reduced motion is on) or `none`.

## Alert

A message about the page or the last action.

```html
<div class="pm-alert pm-alert--error" role="alert">
  <p class="pm-alert__title">The analysis didn’t finish.</p>
  <p>The service took too long to answer. Try again in a minute.</p>
</div>
```

- Tones: `--error`, `--warning`, `--success`, or none for a neutral note (a results summary).
- `role="alert"` only for an error that appears after an action; a note that is there when the page loads needs no role.
- `--inline` swaps the box for a rule on the left, for a note inside running text.
- Hide an empty alert with the `hidden` attribute.

## Loading indicator

The spinner is decorative; the words next to it say what is happening.

```html
<div class="pm-loading" role="status"><span class="pm-spinner" aria-hidden="true"></span>Analyzing — usually 10–20 seconds…</div>

<button class="pm-btn pm-btn--primary" type="button" aria-busy="true"><span class="pm-spinner" aria-hidden="true"></span>Auditing…</button>
```

Inside a button the spinner takes the label's color. With reduced motion it turns slowly instead of stopping, so the page still looks alive.

## Meter

A value on a known range, like a match score. Show the number as text as well.

```html
<div class="pm-meter" data-level="strong" role="meter" aria-valuenow="82" aria-valuemin="0" aria-valuemax="100" aria-label="Match score">
  <div class="pm-meter__fill" style="width:82%"></div>
</div>
```

`data-level`: `strong` (cyan), `moderate` (amber) or `weak` (grey). The fill grows over a second when the width changes, unless reduced motion is on.

## Contrast

In the light theme the status colors are just under 4.5:1 on their own tints, so text on a tint (badges, alert titles) is mixed a fifth of the way toward the text color. The hue stays the same and every combination passes AA on the page, raised and card surfaces in both themes.
