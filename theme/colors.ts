const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(250, 248, 239)',
    grey5: 'rgb(238, 228, 218)',
    grey4: 'rgb(205, 193, 180)',
    grey3: 'rgb(187, 173, 160)',
    grey2: 'rgb(170, 160, 145)',
    grey: 'rgb(119, 110, 101)',
    background: 'rgb(250, 248, 239)',
    foreground: 'rgb(119, 110, 101)',
    root: 'rgb(250, 248, 239)',
    card: 'rgb(238, 228, 218)',
    destructive: 'rgb(255, 0, 0)',
    primary: 'rgb(119, 110, 101)',
    xp: 'rgb(255, 215, 0)',
  },
  dark: {
    grey6: 'rgb(60, 60, 60)',
    grey5: 'rgb(70, 70, 70)',
    grey4: 'rgb(90, 90, 90)',
    grey3: 'rgb(110, 110, 110)',
    grey2: 'rgb(160, 160, 160)',
    grey: 'rgb(200, 200, 200)',
    background: 'rgb(20, 20, 20)',
    foreground: 'rgb(255, 255, 255)',
    root: 'rgb(20, 20, 20)',
    card: 'rgb(45, 45, 45)',
    destructive: 'rgb(255, 0, 0)',
    primary: 'rgb(255, 255, 255)',
    xp: 'rgb(255, 215, 0)',
  },
} as const;

const COLORS = ANDROID_COLORS;

export { COLORS };
