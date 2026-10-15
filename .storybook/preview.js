import '../dist/tokens.css';
import './preview.css';

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
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
