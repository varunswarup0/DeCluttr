let Haptics: typeof import('expo-haptics') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Haptics = require('expo-haptics');
} catch {
  // Haptics module not available
}

export function heavyImpact() {
  Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
}

export function lightImpact() {
  Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function successNotification() {
  Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
