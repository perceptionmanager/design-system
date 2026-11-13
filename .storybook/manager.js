// The Storybook frame (sidebar, toolbar) in the design system's colors and type; follows the visitor's system theme.
import { addons } from 'storybook/manager-api';
import { pmTheme } from './pm-theme.js';

const light = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
addons.setConfig({ theme: pmTheme(light ? 'light' : 'dark') });
