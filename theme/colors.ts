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

const AMUSEMENT_COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(254, 247, 228)',
    grey5: 'rgb(255, 235, 205)',
    grey4: 'rgb(255, 215, 175)',
    grey3: 'rgb(255, 190, 145)',
    grey2: 'rgb(255, 165, 115)',
    grey: 'rgb(85, 70, 70)',
    background: 'rgb(254, 245, 230)',
    foreground: 'rgb(60, 60, 60)',
    root: 'rgb(254, 245, 230)',
    card: 'rgb(255, 231, 210)',
    destructive: 'rgb(255, 80, 80)',
    primary: 'rgb(0, 170, 250)',
    xp: 'rgb(255, 240, 70)',
  },
  dark: {
    grey6: 'rgb(40, 40, 40)',
    grey5: 'rgb(60, 60, 60)',
    grey4: 'rgb(80, 80, 80)',
    grey3: 'rgb(110, 110, 110)',
    grey2: 'rgb(160, 160, 160)',
    grey: 'rgb(200, 200, 200)',
    background: 'rgb(20, 20, 20)',
    foreground: 'rgb(235, 235, 235)',
    root: 'rgb(20, 20, 20)',
    card: 'rgb(40, 40, 40)',
    destructive: 'rgb(255, 80, 80)',
    primary: 'rgb(0, 170, 250)',
    xp: 'rgb(255, 240, 70)',
  },
} as const;

const HORROR_COLORS = {
  white: 'rgb(240, 240, 240)',
  black: 'rgb(0, 0, 0)',
  light: {
    grey6: 'rgb(245, 240, 240)',
    grey5: 'rgb(220, 220, 220)',
    grey4: 'rgb(200, 190, 190)',
    grey3: 'rgb(170, 160, 160)',
    grey2: 'rgb(130, 120, 120)',
    grey: 'rgb(80, 70, 70)',
    background: 'rgb(250, 245, 245)',
    foreground: 'rgb(50, 20, 20)',
    root: 'rgb(250, 245, 245)',
    card: 'rgb(230, 220, 220)',
    destructive: 'rgb(180, 0, 0)',
    primary: 'rgb(75, 0, 130)',
    xp: 'rgb(245, 220, 80)',
  },
  dark: {
    grey6: 'rgb(30, 20, 20)',
    grey5: 'rgb(40, 30, 30)',
    grey4: 'rgb(60, 40, 40)',
    grey3: 'rgb(80, 60, 60)',
    grey2: 'rgb(110, 85, 85)',
    grey: 'rgb(160, 140, 140)',
    background: 'rgb(15, 10, 10)',
    foreground: 'rgb(220, 220, 220)',
    root: 'rgb(15, 10, 10)',
    card: 'rgb(35, 25, 25)',
    destructive: 'rgb(200, 0, 0)',
    primary: 'rgb(120, 0, 150)',
    xp: 'rgb(245, 220, 80)',
  },
} as const;

export const APP_THEME = 'amusement' as const;

const THEMES = {
  default: { colors: ANDROID_COLORS, confetti: ['#f72585', '#ffd166', '#04a9f4'] },
  amusement: {
    colors: AMUSEMENT_COLORS,
    confetti: ['#ff80ab', '#ffd740', '#69f0ae', '#536dfe'],
  },
  horror: {
    colors: HORROR_COLORS,
    confetti: ['#b00020', '#ffffff', '#7209b7'],
  },
} as const;

type ThemeName = keyof typeof THEMES;
const ACTIVE_THEME: ThemeName = APP_THEME;

const COLORS = THEMES[ACTIVE_THEME].colors;
const CONFETTI_COLORS = THEMES[ACTIVE_THEME].confetti;

export { COLORS, CONFETTI_COLORS };
