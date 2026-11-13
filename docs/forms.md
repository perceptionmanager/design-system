# Form fields

Text field, number, text area, dropdown, checkbox and radio. All in `dist/components.css`; no JavaScript. Every state is in Storybook under **Components / Forms**.

## Anatomy

A `.pm-field` holds one label, one control, and optional helper and error text. Tie the helper and error text to the control with `aria-describedby`.

```html
<div class="pm-field">
  <label class="pm-field__label" for="salary-min">Salary min ($) <span class="pm-field__optional">(optional)</span></label>
  <input class="pm-input" id="salary-min" type="number" min="0" step="5000" aria-describedby="salary-min-help salary-min-err">
  <p class="pm-field__help" id="salary-min-help">Leave blank to skip the salary check.</p>
  <p class="pm-field__error" id="salary-min-err">Enter a number, like 120000.</p>
</div>
```

- **Errors:** set `aria-invalid="true"` on the control. The border turns red and the field's `.pm-field__error` appears. Write the error as what to do, not what went wrong in the code.
- **Optional fields:** mark the optional ones, not the required ones; most fields in these tools are required.
- **Disabled:** the native `disabled` attribute. Prefer leaving a control enabled and explaining with an error over disabling it without a reason.

## Controls

| Control | Markup |
|---|---|
| Text, number, email, search | `<input class="pm-input" type="…">` |
| Text area | `<textarea class="pm-textarea">` |
| Text area for pasted code | `<textarea class="pm-textarea pm-textarea--code">` (sunken fill, monospace) |
| Dropdown | `<div class="pm-select"><select>…</select></div>` |
| Checkbox | `<label class="pm-choice"><input class="pm-checkbox" type="checkbox"> Label</label>` |
| Radio | `<label class="pm-choice"><input class="pm-radio" type="radio" name="…"> Label</label>` |

The dropdown is a native `<select>` with the design system's chevron, so keyboard use, screen readers and phone pickers work without script.

Group checkboxes and radios in a fieldset, so the question is read with each option:

```html
<fieldset class="pm-fieldset">
  <legend class="pm-field__label">Work arrangement</legend>
  <label class="pm-choice"><input class="pm-radio" type="radio" name="arrangement" value="remote" checked> Remote</label>
  <label class="pm-choice"><input class="pm-radio" type="radio" name="arrangement" value="hybrid"> Hybrid</label>
</fieldset>
```

## Character count

Put the label and a `.pm-field__count` in a `.pm-field__head`. Set `data-state="warning"` near the limit and `data-state="error"` past it, together with `aria-invalid="true"` on the text area. Announce the count politely (`aria-live="polite"` on a visually hidden copy) only when it changes state, not on every keystroke.

## Sizes and behavior

- Every field is at least 44px tall with a medium radius, like the buttons. Checkbox and radio boxes are 20px; their label makes the target 44px tall.
- Fields use 16px text on phones so iOS does not zoom in on focus. The code text area drops to 14px above 860px.
- The control edge is `color.border.control`, 3:1 or more against every surface in both themes (WCAG 1.4.11). Hover turns it cyan; focus replaces it with the focus ring.
- Windows high-contrast mode redraws the edges and checked states with system colors.
