# Modal

A native `<dialog>` opened with `showModal()`. The browser traps focus inside it, makes the page behind inert, closes it on Escape and returns focus to the control that opened it. Styles in `dist/components.css`; the image modal's wiring in `dist/shell.js`. Storybook: **Components / Modal**.

## Image modal (screenshots)

Put `data-modal-src` (the large image) and `data-modal-alt` (its alt text) on the button that wraps a thumbnail. `shell.js` builds one shared dialog for the page and opens the picture in it. Nothing else to add.

```html
<button type="button" class="shot-btn" data-modal-src="shot-1600.webp" data-modal-alt="Apply Platform wireframes with the four-step shell" aria-label="View larger: Apply Platform wireframes with the four-step shell">
  <img src="shot-960.webp" alt="Apply Platform wireframes with the four-step shell" width="960" height="611">
</button>
```

The close button (44px) sits above the picture's top-right corner; a click on the dim area also closes. A page script can open a picture directly with `pmShell.openImage(src, alt)`.

## Panel modal (confirmation or a short form)

```html
<dialog class="pm-modal pm-modal--panel" id="clearDialog" aria-labelledby="clearTitle">
  <div class="pm-modal__panel">
    <h2 class="pm-modal__title" id="clearTitle">Clear these results?</h2>
    <p>The analysis and your pasted job description are removed from this page.</p>
    <form method="dialog" class="pm-modal__actions">
      <button class="pm-btn pm-btn--tertiary" value="cancel">Keep them</button>
      <button class="pm-btn pm-btn--primary" value="clear">Clear results</button>
    </form>
  </div>
</dialog>
```

Open it with `document.getElementById('clearDialog').showModal()`. The buttons in a `method="dialog"` form close it, and `dialog.returnValue` says which one was pressed. Name the buttons by what they do, not "OK" and "Cancel".

## Behavior

- The page behind does not scroll while a modal is open.
- It fades in and out over 200ms; with reduced motion it appears and disappears at once.
- The portfolio's "popup entrance" (the traced outline and glow) can keep running on top: it watches the dialog's `open` attribute.
