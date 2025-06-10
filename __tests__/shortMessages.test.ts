import {
  MOTIVATION_MESSAGES,
  SESSION_MESSAGES,
  END_MESSAGES,
  MAX_MESSAGE_LENGTH,
} from '../lib/positiveMessages';

test('all messages are short', () => {
  const all = [...MOTIVATION_MESSAGES, ...SESSION_MESSAGES, ...END_MESSAGES];
  for (const msg of all) {
    expect(msg.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
  }
});
