# v0.6.0 inventory: what the products build by hand today

Taken 2026-11-13 from the `preview` branches of the four products. Each row is replaced by a design system component in v0.6.0.

## Form fields

| Product | Element | Current styling | Becomes |
|---|---|---|---|
| Role Analyzer | Job description `<textarea>` | Sunken fill, mono, small size, `border.subtle`, radius md, padding space-4 | Text area, code style |
| Role Analyzer | Salary min / max `<input type="number">` | Raised fill, `border.subtle`, radius **sm**, min-height **40px** | Text field (number) |
| Role Analyzer | Arrangement `<select>` | Same as the salary inputs, browser arrow | Dropdown |
| Role Analyzer | Field labels | Two styles: `.ra-label` (small, semibold, secondary) and `.criteria label` (caption, secondary) | Field label (one style) |
| Kiro UX Auditor | Code `<textarea>` | Same as the Role Analyzer text area, plus `aria-invalid` red border | Text area, code style |
| Kiro UX Auditor | Label, character count, hint | `.ka-label`, `.ka-count` and `.ka-hint` with warning and error states | Field label, counter, helper text |
| Portfolio | Ask box `<input type="text">` | Gradient border, glow, sparkle icon, keyboard hint, clear button | Stays custom (brand moment); uses the field tokens for text, placeholder and focus |

Not used anywhere yet: checkbox, radio. Built in v0.6.0 so the next form doesn't invent them.

## Feedback

| Product | Element | Current styling | Becomes |
|---|---|---|---|
| Role Analyzer | `.error-box` | Error subtle fill, error border, radius md | Alert (error) |
| Kiro UX Auditor | `.ka-alert` | Same as above | Alert (error) |
| Kiro UX Auditor | `.ka-summary` | Raised fill, card border | Alert (neutral) |
| Role Analyzer | `.loading` + `.spinner` | 16px ring, cyan arc, 650ms spin | Loading indicator |
| Kiro UX Auditor | Button label "Auditing…" | Text only, no indicator | Loading indicator on the button |
| UX Design Briefing | `.run-status` | Dot + text; dot color by `data-state` (fresh, stale, error, loading) | Status (dot) |
| Kiro UX Auditor | `.ka-badge` | Severity pill: critical, high, medium, low | Status badge |
| Role Analyzer | `.gap-pill` | Coral subtle pill | Status badge (accent) |
| Role Analyzer | `.score-track` / `.score-fill` | 4px track, fill colored strong / moderate / weak, 1s grow | Meter |
| Role Analyzer | `.scenario` | Warning left rule | Alert (warning, inline) |

## Modal

| Product | Element | Current styling | Becomes |
|---|---|---|---|
| Portfolio (7 case studies, 2 of them gated) | `.modal-overlay`, `.modal-card`, `.modal-img`, `.modal-close` + a script per page | A plain div: strong scrim, 1000px card, 36px round close button above the image. Focus stays on the page behind and isn't returned | Modal (image), on a native `<dialog>` |
| Role Analyzer, Briefing, Kiro UX Auditor | The same CSS | Copied in with the portfolio styles, never used | Deleted |

## Lab page layout

About 340 lines repeated in each tool's `site.css`, copied from the portfolio. Only the wrapper, hero, section, split block and the two entrance animations were used; the rest was case-study styles the tools never rendered: `.wrap`, `.sec-hero`, `.hero-title`, `.hero-desc`, `.sec-challenge`, `.sec-stats`, `.sec-visual`, `.visual-grid`, `.visual-card`, `.visual-title`, `.visual-desc`, `.shot-btn`, `.shot-img`, `.sec-outcomes`, `.outcomes-title`, `.sec-learning`, `.sec-cta`, `.cta-heading`, `.cta-actions`, `.fade-in`, `.cs-*` and the glow helpers. Becomes the Lab page layout (step 5).

## Problems found

1. **Control borders fail WCAG 1.4.11.** Every field uses `border.subtle` (1.3:1) or `border.strong` on hover (2.2:1 dark, 1.8:1 light) as its edge, under the 3:1 a control's boundary needs. New `color.border.control` fixes it (3.6:1 or more in both themes).
2. **Two field heights and radii.** The Role Analyzer's small inputs are 40px with radius sm; the text areas use radius md. Fields standardize on the 44px target and radius md, like the buttons.
3. **Monospace stack repeated.** Both tools hard-code `ui-monospace, "SF Mono", Menlo, monospace`. Now `font.family.mono`.
4. **No success tint.** Success had a color but no subtle fill or border, so a success alert couldn't match the others. Added.
