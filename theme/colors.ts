const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(252, 253, 251)',
    grey5: 'rgb(240, 245, 244)',
    grey4: 'rgb(210, 225, 224)',
    grey3: 'rgb(180, 205, 204)',
    grey2: 'rgb(150, 185, 184)',
    grey: 'rgb(85, 100, 100)',
    background: 'rgb(248, 250, 248)',
    foreground: 'rgb(60, 60, 60)',
    root: 'rgb(248, 250, 248)',
    card: 'rgb(240, 245, 244)',
    destructive: 'rgb(255, 0, 0)',
    primary: 'rgb(0, 150, 136)',
    xp: 'rgb(255, 215, 0)',
  },
  dark: {
    grey6: 'rgb(60, 70, 70)',
    grey5: 'rgb(70, 80, 80)',
    grey4: 'rgb(90, 100, 100)',
    grey3: 'rgb(110, 120, 120)',
    grey2: 'rgb(160, 170, 170)',
    grey: 'rgb(200, 210, 210)',
    background: 'rgb(20, 24, 24)',
    foreground: 'rgb(235, 235, 235)',
    root: 'rgb(20, 24, 24)',
    card: 'rgb(40, 45, 45)',
    destructive: 'rgb(255, 0, 0)',
    primary: 'rgb(0, 150, 136)',
    xp: 'rgb(255, 215, 0)',
  },
} as const;

const COLORS = ANDROID_COLORS;

export { COLORS };
