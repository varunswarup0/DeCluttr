let Haptics: typeof import('expo-haptics') | null = null;
try {
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
