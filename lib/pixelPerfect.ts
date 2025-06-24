import { PixelRatio } from 'react-native';

/**
 * Convert a design measurement to the closest pixel.
 * Helps achieve crisp UI on all screen densities.
 */
export function px(size: number): number {
  return PixelRatio.roundToNearestPixel(size);
}
