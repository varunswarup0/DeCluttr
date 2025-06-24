import * as React from 'react';
import { View } from 'react-native';
import { px } from '~/lib/pixelPerfect';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { cn } from '~/lib/cn';

const DEFAULT_MAX = 100;

const ProgressIndicator = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View> & {
    value?: number;
    max?: number;
    getValueLabel?: (value: number, max: number) => string;
  }
>(
  (
    {
      value: valueProp,
      max: maxProp,
      getValueLabel = defaultGetValueLabel,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const max = maxProp ?? DEFAULT_MAX;
    const value = isValidValueNumber(valueProp, max) ? valueProp : 0;
    const progress = useSharedValue(value);

    React.useEffect(() => {
      progress.value = withSpring(value, { overshootClamping: true });
    }, [value, progress]);

    const indicator = useAnimatedStyle(() => {
      const width = interpolate(progress.value, [0, max], [1, 100], Extrapolation.CLAMP);
      return { width: `${width}%` };
    }, [max]);

    return (
      <View
        role="progressbar"
        ref={ref}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value}
        aria-valuetext={getValueLabel(value, max)}
        accessibilityValue={{
          min: 0,
          max,
          now: value,
          text: getValueLabel(value, max),
        }}
        className={cn('relative w-full overflow-hidden', className)}
        style={{ height: px(4), borderRadius: px(4) }}
        {...props}>
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-muted opacity-20" />
        <Animated.View role="presentation" style={indicator} className={cn('h-full bg-primary')} />
      </View>
    );
  }
);

ProgressIndicator.displayName = 'ProgressIndicator';

export { ProgressIndicator };

function defaultGetValueLabel(value: number, max: number) {
  return `${Math.round((value / max) * 100)}%`;
}

function isValidValueNumber(value: any, max: number): value is number {
  return typeof value === 'number' && !isNaN(value) && value <= max && value >= 0;
}
