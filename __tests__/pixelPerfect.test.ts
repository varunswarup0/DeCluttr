jest.mock('react-native', () => ({
  PixelRatio: { roundToNearestPixel: jest.fn((v) => Math.round(v)) },
}));

import { px } from '../lib/pixelPerfect';
import { PixelRatio } from 'react-native';

describe('px helper', () => {
  it('rounds to nearest pixel', () => {
    jest.spyOn(PixelRatio, 'roundToNearestPixel').mockReturnValueOnce(5);
    expect(px(5.2)).toBe(5);
    expect(PixelRatio.roundToNearestPixel).toHaveBeenCalledWith(5.2);
  });
});
