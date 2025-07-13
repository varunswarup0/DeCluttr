import { deltaMagnitude, isShake } from '../lib/useShake';

jest.mock(
  'expo-sensors',
  () => ({
    Accelerometer: {
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      setUpdateInterval: jest.fn(),
    },
  }),
  { virtual: true }
);

test('deltaMagnitude computes distance', () => {
  const a = { x: 0, y: 0, z: 0 };
  const b = { x: 1, y: 2, z: 2 };
  const dist = deltaMagnitude(a, b);
  expect(dist).toBeCloseTo(3);
});

test('isShake detects movement above threshold', () => {
  const a = { x: 0, y: 0, z: 0 };
  const b = { x: 2, y: 2, z: 2 };
  expect(isShake(a, b, 1.5)).toBe(true);
});

test('isShake ignores small movement', () => {
  const a = { x: 0, y: 0, z: 0 };
  const b = { x: 0.2, y: 0.2, z: 0.2 };
  expect(isShake(a, b, 1)).toBe(false);
});
