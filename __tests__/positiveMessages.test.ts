import { randomMessage, createMessagePicker } from '../lib/positiveMessages';

test('randomMessage returns element from list', () => {
  const items = ['a', 'b', 'c'];
  const msg = randomMessage(items);
  expect(items).toContain(msg);
});

test('createMessagePicker avoids immediate repeats', () => {
  const items = ['a', 'b'];
  const pick = createMessagePicker(items);
  const first = pick();
  const second = pick();
  expect(second).not.toBe(first);
  expect(items).toContain(second);
});
