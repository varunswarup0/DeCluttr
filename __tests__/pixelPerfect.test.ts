import { px } from '../lib/pixelPerfect';
import { PixelRatio } from 'react-native';

jest.mock('react-native', () => ({
  PixelRatio: { get: jest.fn(() => 2) },
}));

describe('px helper', () => {
  it('rounds to nearest pixel', () => {
    // px should use the mocked pixel scale of 2
    expect(px(5.2)).toBe(Math.round(5.2 * 2) / 2);
    expect(PixelRatio.get).toHaveBeenCalled();
  });
});
