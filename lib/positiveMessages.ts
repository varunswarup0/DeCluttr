export const MOTIVATION_MESSAGES = [
  'Great job keeping your gallery tidy!',
  'Every swipe counts toward a cleaner phone!',
  "You're doing awesome, keep it up!",
  'Nice work! Your photos appreciate the love.',
  'You deserve a clutter\u2011free gallery!',
  'Every photo you clear makes room for joy!',
  "You're in control and doing great!",
  'Clutter\u2011free gallery, clutter\u2011free mind!',
  'Your progress is inspiring!',
  'Looking cool while cleaning up!',
  'Swipe power activated!'
] as const;

export const SESSION_MESSAGES = [
  'Great progress! Ready for more?',
  'Awesome work! Your gallery is getting cleaner.',
  'Looking good! New photos just arrived.',
  'Fantastic job! Keep enjoying the declutter.',
] as const;

export const END_MESSAGES = [
  "You're all caught up!",
  'Gallery all cleaned up!',
  'Nice work, no more photos!',
] as const;

export function randomMessage(messages: readonly string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function createMessagePicker(messages: readonly string[]): () => string {
  let last = -1;
  return () => {
    let index = Math.floor(Math.random() * messages.length);
    if (messages.length > 1 && index === last) {
      index = (index + 1) % messages.length;
    }
    last = index;
    return messages[index];
  };
}
