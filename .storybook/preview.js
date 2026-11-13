import '../dist/tokens.css';
import '../dist/components.css';
import './preview.css';
import { pmTheme } from './pm-theme.js';

// open in the visitor's system theme, like the products; the toolbar switch still flips it
const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  // Toolbar switch between the two themes: sets <html data-theme> in the preview frame, the same attribute products set.
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: { title: 'Theme', icon: 'circlehalf', items: [{ value: 'dark', title: 'Dark' }, { value: 'light', title: 'Light' }], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: systemTheme },
  decorators: [
    (story, context) => {
      document.documentElement.setAttribute('data-theme', context.globals.theme || systemTheme);
      return story();
    },
  ],
  parameters: {
    // docs pages in the design system's colors and type, in the system theme
    docs: { theme: pmTheme(systemTheme) },
    backgrounds: { disabled: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
