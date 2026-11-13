# Page layout

The content patterns of a Lab tool page, in `dist/shell.css` with the rest of the page shell. Storybook: **Shell / Lab page** assembles a whole page from the design system alone.

`shell.css` also carries the base reset every page shares (box sizing, body colors and font, display font on headings, focus ring, image sizing), in the `base` layer so any component or product rule wins over it.

```html
<main id="main" tabindex="-1">
  <section class="pm-hero pm-wrap">
    <p class="pm-pill pm-fade-in" style="animation-delay:.05s"><span class="pm-pill__dot" aria-hidden="true"></span>Role fit analysis</p>
    <h1>Score a role against my background.</h1>
    <p class="pm-hero__sub pm-fade-in" style="animation-delay:.25s">One or two sentences on what the tool does.</p>
  </section>

  <div class="pm-wrap pm-section--stats pm-fade-in" style="animation-delay:.35s">
    <div class="pm-stat-bar">…</div>
  </div>

  <section class="pm-wrap pm-section" id="analyze">
    <h2>Analyze a role</h2>
    <p class="pm-section__desc">What to paste and what comes back.</p>
    <!-- the tool: a .pm-card with .pm-field controls, then .pm-alert / .pm-loading / results -->
  </section>

  <section class="pm-wrap pm-split" id="method">
    <h2>How it works</h2>
    <div>
      <p class="pm-split__intro">One paragraph on the method.</p>
      <ol class="pm-steps">…</ol>
      <p class="pm-split__note">Sources and caveats.</p>
    </div>
  </section>
</main>
```

| Class | What it is |
|---|---|
| `.pm-wrap` | Centers content at the content width with the page gutter. |
| `.pm-hero`, `.pm-hero__sub`, `.pm-hero__actions` | The page opening: eyebrow pill, title, lead sentence, optional buttons (stacked full width on phones). |
| `.pm-section--stats` | Spacing for the stat bar under the hero. |
| `.pm-section`, `.pm-section__desc` | A titled block: heading-lg title (heading-md on phones) and a description. |
| `.pm-split`, `.pm-split__intro`, `.pm-split__note` | Heading in a 280px column beside its content; stacks on phones. |
| `.pm-fade-in` | The block fades up on load. Stagger with `animation-delay`. |
| `.pm-split-word` | One word of a title rising into place. The shell's title pop-in already animates every `h1`, so use this only for a title outside `.pm-page`. |

Both entrance animations are off with reduced motion.
