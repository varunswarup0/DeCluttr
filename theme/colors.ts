const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(245, 245, 245)',
    grey5: 'rgb(230, 230, 230)',
    grey4: 'rgb(210, 210, 210)',
    grey3: 'rgb(180, 180, 180)',
    grey2: 'rgb(120, 120, 120)',
    grey: 'rgb(80, 80, 80)',
    background: 'rgb(255, 255, 255)',
    foreground: 'rgb(0, 0, 0)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    destructive: 'rgb(255, 0, 0)',
    primary: 'rgb(0, 0, 0)',
    xp: 'rgb(255, 215, 0)',
  },
  dark: {
    grey6: 'rgb(60, 60, 60)',
    grey5: 'rgb(70, 70, 70)',
    grey4: 'rgb(90, 90, 90)',
    grey3: 'rgb(110, 110, 110)',
    grey2: 'rgb(160, 160, 160)',
    grey: 'rgb(200, 200, 200)',
    background: 'rgb(0, 0, 0)',
    foreground: 'rgb(255, 255, 255)',
    root: 'rgb(0, 0, 0)',
    card: 'rgb(30, 30, 30)',
    destructive: 'rgb(255, 0, 0)',
    primary: 'rgb(255, 255, 255)',
    xp: 'rgb(255, 215, 0)',
  },
} as const;

const COLORS = ANDROID_COLORS;

export { COLORS };
