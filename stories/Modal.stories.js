// Modal: a native <dialog> opened with showModal(). Image modal (shell.js wires data-modal-src buttons) and panel modal.
import '../dist/shell.css';
import { icon } from './icon.js';

export default {
  title: 'Components/Modal',
  parameters: { layout: 'padded' },
};

const shot = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="#20242f"/><rect x="80" y="80" width="1440" height="80" rx="12" fill="#2b3040"/><rect x="80" y="220" width="420" height="700" rx="16" fill="#2b3040"/><rect x="560" y="220" width="960" height="320" rx="16" fill="#ff6a4c" opacity=".55"/><rect x="560" y="600" width="960" height="320" rx="16" fill="#45e0ff" opacity=".45"/></svg>`);

const closeBtn = `<button type="button" class="pm-modal__close" aria-label="Close" onclick="this.closest('dialog').close()">${icon('close')}</button>`;

export const ImageModal = {
  name: 'Image modal',
  render: () => {
    const el = document.createElement('div');
    el.innerHTML = `<div style="font-family:var(--pm-font-family-sans);display:flex;flex-direction:column;gap:var(--pm-space-4);align-items:flex-start">
      <p style="margin:0;color:var(--pm-color-text-secondary)">Any button with <code>data-modal-src</code> opens the picture in the shared modal (shell.js). Escape, the close button or a click on the dim area closes it, and focus returns to the button.</p>
      <button type="button" class="pm-btn pm-btn--ghost" data-modal-src="${shot}" data-modal-alt="Example wireframe: header, sidebar and two content panels">View larger</button>
    </div>
    <dialog class="pm-modal" id="sbImageModal" aria-label="Example wireframe">${closeBtn}<div class="pm-modal__body"><img class="pm-modal__img" src="${shot}" alt="Example wireframe: header, sidebar and two content panels"></div></dialog>`;
    el.querySelector('[data-modal-src]').addEventListener('click', () => el.querySelector('#sbImageModal').showModal());
    return el;
  },
};

export const PanelModal = {
  name: 'Panel modal',
  render: () => {
    const el = document.createElement('div');
    el.innerHTML = `<button type="button" class="pm-btn pm-btn--ghost">Clear results</button>
    <dialog class="pm-modal pm-modal--panel" aria-labelledby="sbPanelTitle">
      <div class="pm-modal__panel">
        <h2 class="pm-modal__title" id="sbPanelTitle">Clear these results?</h2>
        <p style="margin:0;color:var(--pm-color-text-secondary)">The analysis and your pasted job description are removed from this page. Nothing is saved anywhere else.</p>
        <form method="dialog" class="pm-modal__actions">
          <button class="pm-btn pm-btn--tertiary" value="cancel">Keep them</button>
          <button class="pm-btn pm-btn--primary" value="clear">Clear results</button>
        </form>
      </div>
    </dialog>`;
    el.querySelector('button').addEventListener('click', () => el.querySelector('dialog').showModal());
    return el;
  },
};

export const OpenForReview = {
  name: 'Open (for review)',
  render: () => {
    const el = document.createElement('div');
    el.innerHTML = `<dialog class="pm-modal" aria-label="Example wireframe">${closeBtn}<div class="pm-modal__body"><img class="pm-modal__img" src="${shot}" alt="Example wireframe: header, sidebar and two content panels"></div></dialog>`;
    requestAnimationFrame(() => el.querySelector('dialog').showModal());
    return el;
  },
};
