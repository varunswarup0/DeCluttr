import { PixelRatio } from 'react-native';

const pixelScale = PixelRatio.get();

/**
 * Convert a design measurement to the closest pixel.
 * Helps achieve crisp UI on all screen densities.
 */
export function px(size: number): number {
  'worklet';
  return Math.round(size * pixelScale) / pixelScale;
}
