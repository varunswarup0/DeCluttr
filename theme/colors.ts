const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(246, 247, 255)',
    grey5: 'rgb(230, 233, 255)',
    grey4: 'rgb(220, 228, 245)',
    grey3: 'rgb(200, 208, 230)',
    grey2: 'rgb(90, 98, 116)',
    grey: 'rgb(40, 40, 46)',
    background: 'rgb(246, 247, 255)',
    foreground: 'rgb(40, 40, 46)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    destructive: 'rgb(255, 107, 107)',
    primary: 'rgb(81, 140, 255)',
    xp: 'rgb(255, 215, 0)',
  },
  dark: {
    grey6: 'rgb(34, 37, 42)',
    grey5: 'rgb(40, 42, 49)',
    grey4: 'rgb(64, 68, 79)',
    grey3: 'rgb(64, 74, 89)',
    grey2: 'rgb(140, 150, 170)',
    grey: 'rgb(200, 208, 230)',
    background: 'rgb(34, 37, 42)',
    foreground: 'rgb(255, 255, 255)',
    root: 'rgb(34, 37, 42)',
    card: 'rgb(40, 42, 49)',
    destructive: 'rgb(255, 107, 107)',
    primary: 'rgb(81, 140, 255)',
    xp: 'rgb(255, 215, 0)',
  },
} as const;

const COLORS = ANDROID_COLORS;

export { COLORS };
