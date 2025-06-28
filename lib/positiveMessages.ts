/** Maximum length for in-app messages. */
export const MAX_MESSAGE_LENGTH = 30 as const;

export const MOTIVATION_MESSAGES = [
  'Great!',
  'Swipe on!',
  'Keep going!',
  'Nice!',
  'Look sharp!',
  'Power up!',
] as const;

export const SESSION_MESSAGES = ['More to clean!', 'Fresh batch!', 'Ready for action!'] as const;

export const END_MESSAGES = ['All caught up!', 'Gallery clean!', 'No more photos!'] as const;

// Short encouraging messages shown occasionally after deletes
export const SURPRISE_MESSAGES = ['Nice swipe!', "You're on fire!"] as const;

/**
 * Return a random element from the provided list.
 */
export function randomMessage(messages: readonly string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Create a picker that avoids repeating the last message.
 */
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
