/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|mjs|ts)',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/html-vite',
};
export default config;
