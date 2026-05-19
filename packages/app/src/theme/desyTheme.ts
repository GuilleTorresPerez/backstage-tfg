import {
  createUnifiedTheme,
  genPageTheme,
  palettes,
  shapes,
  UnifiedTheme,
} from '@backstage/theme';
import { desyTokens } from './desyTokens';

const CANONICAL_PAGE_TYPES = [
  'home',
  'documentation',
  'tool',
  'service',
  'website',
  'library',
  'other',
  'app',
  'apis',
] as const;

export type DesyTokens = {
  palette: {
    primary: { main: string };
    secondary: { main: string };
    error: { main: string };
    warning: { main: string };
    info: { main: string };
    success: { main: string };
    background: { default: string; paper: string };
    navigation: { background: string };
  };
  typography: {
    fontFamily: string;
  };
  pageTheme: {
    accent: string;
  };
};

export function buildDesyTheme(tokens: DesyTokens): UnifiedTheme {
  const accentPage = genPageTheme({
    colors: [tokens.pageTheme.accent],
    shape: shapes.wave,
  });

  const pageTheme = Object.fromEntries(
    CANONICAL_PAGE_TYPES.map(id => [id, accentPage]),
  );

  return createUnifiedTheme({
    palette: {
      ...palettes.light,
      primary: { main: tokens.palette.primary.main },
      secondary: { main: tokens.palette.secondary.main },
      error: { main: tokens.palette.error.main },
      warning: { main: tokens.palette.warning.main },
      info: { main: tokens.palette.info.main },
      success: { main: tokens.palette.success.main },
      background: {
        default: tokens.palette.background.default,
        paper: tokens.palette.background.paper,
      },
      navigation: {
        ...palettes.light.navigation,
        background: tokens.palette.navigation.background,
      },
    },
    pageTheme,
    defaultPageTheme: 'home',
    fontFamily: tokens.typography.fontFamily,
  });
}

export const desyTheme = buildDesyTheme(desyTokens);
