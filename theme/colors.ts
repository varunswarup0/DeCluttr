const ANDROID_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(255, 244, 225)',
    grey5: 'rgb(215, 217, 228)',
    grey4: 'rgb(193, 198, 215)',
    grey3: 'rgb(113, 119, 134)',
    grey2: 'rgb(65, 71, 84)',
    grey: 'rgb(27, 27, 27)',
    background: 'rgb(255, 244, 225)',
    foreground: 'rgb(0, 0, 0)',
    root: 'rgb(255, 255, 255)',
    card: 'rgb(255, 255, 255)',
    destructive: 'rgb(255, 107, 107)',
    primary: 'rgb(78, 205, 196)',
    xp: 'rgb(255, 215, 0)',
  },
  dark: {
    grey6: 'rgb(27, 27, 27)',
    grey5: 'rgb(39, 42, 50)',
    grey4: 'rgb(49, 53, 61)',
    grey3: 'rgb(54, 57, 66)',
    grey2: 'rgb(139, 144, 160)',
    grey: 'rgb(193, 198, 215)',
    background: 'rgb(27, 27, 27)',
    foreground: 'rgb(255, 255, 255)',
    root: 'rgb(27, 27, 27)',
    card: 'rgb(27, 27, 27)',
    destructive: 'rgb(255, 107, 107)',
    primary: 'rgb(78, 205, 196)',
    xp: 'rgb(255, 215, 0)',
  },
} as const;

const COLORS = ANDROID_COLORS;

export { COLORS };
