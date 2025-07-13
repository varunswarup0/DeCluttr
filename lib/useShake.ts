import { useEffect, useRef } from 'react';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculate the magnitude difference between two sensor samples.
 */
export function deltaMagnitude(a: Vec3, b: Vec3): number {
  'worklet';
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Determine whether the difference indicates a shake.
 */
export function isShake(a: Vec3, b: Vec3, threshold = 1.4): boolean {
  return deltaMagnitude(a, b) > threshold;
}

/**
 * React hook that calls `onShake` when the device is shaken.
 * Keeps logic lightweight by comparing successive accelerometer samples.
 */
export function useShake(onShake: () => void, threshold = 1.4) {
  const last = useRef<AccelerometerMeasurement | null>(null);
  const lastTime = useRef(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener((data: AccelerometerMeasurement) => {
      const previous = last.current;
      if (previous && isShake(previous, data, threshold)) {
        const now = Date.now();
        if (now - lastTime.current > 500) {
          lastTime.current = now;
          onShake();
        }
      }
      last.current = data;
    });
    return () => {
      sub.remove();
    };
  }, [onShake, threshold]);
}
