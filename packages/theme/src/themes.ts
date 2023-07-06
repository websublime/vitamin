/* eslint-disable max-len */
import colors from 'tailwindcss/colors.js';

// eslint-disable-next-line unicorn/no-object-as-default-parameter
const horizonTheme = (options = { colors: {}, globals: {} }) => {
  const mapper = new Map();

  mapper.set('globals', {
    fontFamily:
      'Lato, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
    fontSize: '16px',
    opacityColor: '1',
    ...options.globals
  });

  mapper.set('colors', {
    black: colors.gray[900],
    danger: colors.red[300],
    'danger-dark': colors.red[600],
    'danger-light': '#feeaea',
    dark: '#212226',
    error: colors.red[400],
    'error-dark': colors.red[900],
    'error-light': colors.red[100],
    ghost: 'transparent',
    grey: '#999fa9',
    'grey-dark': colors.gray[600],
    'grey-light': '#eff0f2',
    info: colors.blue[400],
    'info-dark': colors.blue[600],
    'info-light': '#ecf1ff',
    light: colors.gray[100],
    primary: '#61b11f',
    'primary-dark': '#4d9d0b',
    'primary-light': '#ebf4e4',
    secondary: colors.purple[400],
    'secondary-dark': colors.purple[600],
    'secondary-light': colors.purple[200],
    success: colors.green[400],
    'success-dark': colors.green[600],
    'success-light': colors.green[200],
    tertiary: '#e2efb0',
    'tertiary-dark': '#45b04a',
    'tertiary-light': '#f3f6f2',
    warning: colors.yellow[400],
    'warning-dark': colors.amber[500],
    'warning-light': '#fff7e2',
    white: colors.white,
    ...options.colors
  });

  return {
    colors: mapper.get('colors'),
    globals: mapper.get('globals')
  };
};

export const theme = {
  orizon: horizonTheme
};
