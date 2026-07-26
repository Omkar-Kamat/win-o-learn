const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const getThemeColors = () => ({
  primary: cssVar('--color-primary'),
  success: cssVar('--color-success'),
  warning: cssVar('--color-warning'),
  error: cssVar('--color-error'),
  info: cssVar('--color-info'),
  background: cssVar('--color-bg'),
  surface: cssVar('--color-surface'),
  border: cssVar('--color-border'),
  text: cssVar('--color-text'),
  muted: cssVar('--color-muted'),
});

export const tokens = {
  radius: { md: 10, lg: 16, xl: 20, full: 999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 40, '3xl': 48, '4xl': 64 },
  typography: { hero: 48, h1: 36, h2: 30, h3: 24, title: 20, body: 16, small: 14, tiny: 12 },
};
