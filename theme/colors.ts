const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(247, 248, 255)',
    grey5: 'rgb(228, 232, 246)',
    grey4: 'rgb(208, 212, 232)',
    grey3: 'rgb(140, 146, 169)',
    grey2: 'rgb(97, 103, 123)',
    grey: 'rgb(25, 28, 35)',
    background: 'rgb(250, 250, 252)',
    foreground: 'rgb(25, 28, 35)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    destructive: 'rgb(255, 160, 160)',
    primary: 'rgb(173, 213, 255)',
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
    destructive: 'rgb(255, 120, 120)',
    primary: 'rgb(136, 173, 255)',
  },
} as const;

const COLORS = ANDROID_COLORS;

export { COLORS };
