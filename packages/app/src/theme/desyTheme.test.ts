import { buildDesyTheme } from './desyTheme';

const fixtureTokens = {
  palette: {
    primary: { main: '#111111' },
    secondary: { main: '#222222' },
    error: { main: '#333333' },
    warning: { main: '#444444' },
    info: { main: '#555555' },
    success: { main: '#666666' },
    background: { default: '#777777', paper: '#888888' },
    navigation: { background: '#999999' },
  },
  typography: {
    fontFamily: '"Test Font", sans-serif',
  },
  pageTheme: {
    accent: '#abcdef',
  },
};

describe('buildDesyTheme', () => {
  it('maps palette tokens onto the unified theme palette', () => {
    const theme = buildDesyTheme(fixtureTokens).getTheme('v5');
    if (!theme) throw new Error('expected v5 theme');

    expect(theme.palette.primary.main).toBe(fixtureTokens.palette.primary.main);
    expect(theme.palette.secondary.main).toBe(
      fixtureTokens.palette.secondary.main,
    );
    expect(theme.palette.error.main).toBe(fixtureTokens.palette.error.main);
    expect(theme.palette.warning.main).toBe(fixtureTokens.palette.warning.main);
    expect(theme.palette.info.main).toBe(fixtureTokens.palette.info.main);
    expect(theme.palette.success.main).toBe(fixtureTokens.palette.success.main);
    expect(theme.palette.background.default).toBe(
      fixtureTokens.palette.background.default,
    );
    expect(theme.palette.navigation.background).toBe(
      fixtureTokens.palette.navigation.background,
    );
  });

  it('replicates pageTheme.accent across the 9 canonical page types', () => {
    const canonicalKeys = [
      'home',
      'documentation',
      'tool',
      'service',
      'website',
      'library',
      'other',
      'app',
      'apis',
    ];
    const theme = buildDesyTheme(fixtureTokens).getTheme('v5') as any;
    if (!theme) throw new Error('expected v5 theme');

    for (const key of canonicalKeys) {
      expect(
        theme.page[key] ?? theme.getPageTheme({ themeId: key }),
      ).toBeDefined();
    }

    for (const key of canonicalKeys) {
      const pt = theme.getPageTheme({ themeId: key });
      expect(pt.colors).toContain(fixtureTokens.pageTheme.accent);
    }
  });

  it('exposes tokens.typography.fontFamily on the unified theme', () => {
    const theme = buildDesyTheme(fixtureTokens).getTheme('v5');
    if (!theme) throw new Error('expected v5 theme');

    expect(theme.typography.fontFamily).toBe(
      fixtureTokens.typography.fontFamily,
    );
  });
});
