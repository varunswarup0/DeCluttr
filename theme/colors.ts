const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(34, 34, 34)',
  light: {
    grey6: 'rgb(246, 248, 255)',
    grey5: 'rgb(230, 235, 246)',
    grey4: 'rgb(212, 218, 233)',
    grey3: 'rgb(144, 150, 170)',
    grey2: 'rgb(100, 106, 126)',
    grey: 'rgb(34, 34, 34)',
    background: 'rgb(248, 249, 253)',
    foreground: 'rgb(34, 34, 34)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    destructive: 'rgb(255, 185, 185)',
    primary: 'rgb(167, 211, 248)',
  },
  dark: {
    grey6: 'rgb(30, 33, 42)',
    grey5: 'rgb(45, 50, 63)',
    grey4: 'rgb(66, 70, 83)',
    grey3: 'rgb(120, 125, 145)',
    grey2: 'rgb(170, 175, 193)',
    grey: 'rgb(230, 232, 240)',
    background: 'rgb(18, 21, 30)',
    foreground: 'rgb(230, 232, 240)',
    root: 'rgb(18, 21, 30)',
    card: 'rgb(30, 33, 42)',
    destructive: 'rgb(255, 140, 140)',
    primary: 'rgb(168, 213, 255)',
  },
} as const;

const COLORS = ANDROID_COLORS;

export { COLORS };
