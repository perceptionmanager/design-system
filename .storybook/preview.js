import '../dist/tokens.css';
import '../dist/components.css';
import './preview.css';

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  // Toolbar switch between the two themes: sets <html data-theme> in the preview frame, the same attribute products set.
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: { title: 'Theme', icon: 'circlehalf', items: [{ value: 'dark', title: 'Dark' }, { value: 'light', title: 'Light' }], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'dark' },
  decorators: [
    (story, context) => {
      document.documentElement.setAttribute('data-theme', context.globals.theme || 'dark');
      return story();
    },
  ],
  parameters: {
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
