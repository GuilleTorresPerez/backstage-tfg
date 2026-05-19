/**
 * DESY visual tokens for Backstage chrome theming.
 *
 * Source of truth (pinned for reproducibility — see docs/desy-tokens.md):
 *   Starter: https://bitbucket.org/sdaragon/desy-html-starter
 *   Starter commit: cd877721ed788dfc8952decc81d004a5989aed21
 *   Resolves desy-html@16.0.4 (from starter's package.json)
 *
 * Color values originate from:
 *   node_modules/desy-html/src/css/styles.css  (CSS custom properties)
 * Typography & font policy originate from:
 *   node_modules/desy-html/branding/branding.config.js  (fontFamily.sans)
 *
 * Tokens NOT ported here (out of scope for the tracer bullet) are listed in
 * docs/desy-tokens.md with justification.
 */

import { DesyTokens } from './desyTheme';

export const desyTokens: DesyTokens = {
  palette: {
    // --color-primary-base
    primary: { main: '#00607a' },
    // DESY has no distinct "secondary"; use the neutral mid value as the
    // closest equivalent for MUI's secondary slot (used by accents on
    // controls). See docs/desy-tokens.md for the mapping decision.
    // --color-neutral-base
    secondary: { main: '#92949b' },
    // --color-alert-base
    error: { main: '#d22333' },
    // --color-warning-base
    warning: { main: '#fdcb33' },
    // --color-info-base
    info: { main: '#fa9902' },
    // --color-success-base
    success: { main: '#24d14c' },
    background: {
      // --color-neutral-lighter
      default: '#f6f6f5',
      // --color-white
      paper: '#ffffff',
    },
    navigation: {
      // Sidebar in DESY corporate blue, dark variant.
      // --color-primary-dark
      background: '#00475c',
    },
  },
  typography: {
    // branding.config.js -> typography.fontFamily.sans
    fontFamily: '"Open Sans", ui-sans-serif, system-ui, sans-serif',
  },
  pageTheme: {
    // Single accent replicated across the 9 canonical Backstage page types.
    // --color-primary-base
    accent: '#00607a',
  },
};

export const desyTokensSource = {
  starterRepo: 'https://bitbucket.org/sdaragon/desy-html-starter',
  starterCommit: 'cd877721ed788dfc8952decc81d004a5989aed21',
  desyHtmlVersion: '16.0.4',
} as const;
