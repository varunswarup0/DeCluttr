import React, { useState, useCallback, useMemo } from 'react';
import { View, Dimensions, PixelRatio } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { SwipeCard } from './SwipeCard';
import { cn } from '~/lib/cn';

const { width: screenWidth } = Dimensions.get('window');
const CONTAINER_WIDTH = PixelRatio.roundToNearestPixel(screenWidth * 0.9);
const CONTAINER_HEIGHT = PixelRatio.roundToNearestPixel(screenWidth * 1.2);

export interface SwipeDeckItem {
  id: string;
  imageUri: string;
}

export interface SwipeDeckProps {
  data: SwipeDeckItem[];
  onSwipeLeft?: (item: SwipeDeckItem, index: number) => void;
  onSwipeRight?: (item: SwipeDeckItem, index: number) => void;
  onDeckEmpty?: () => void;
  maxVisibleCards?: number;
  cardSpacing?: number;
  className?: string;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  data,
  onSwipeLeft,
  onSwipeRight,
  onDeckEmpty,
  maxVisibleCards = 3,
  cardSpacing = 8,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const [cooldown, setCooldown] = useState(false);

  const triggerCooldown = useCallback(() => {
    setCooldown(true);
    const to = setTimeout(() => setCooldown(false), 300);
    timeoutsRef.current.push(to);
  }, []);

  // Clear any pending timeouts on unmount or data reset
  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  // Create animation values for each card position in the stack - fixed approach
  const scale0 = useSharedValue(1);
  const scale1 = useSharedValue(0.95);
  const scale2 = useSharedValue(0.9);
  const translateY0 = useSharedValue(0);
  const translateY1 = useSharedValue(8);
  const translateY2 = useSharedValue(16);
  const opacity0 = useSharedValue(1);
  const opacity1 = useSharedValue(0.9);
  const opacity2 = useSharedValue(0.8);
  const scaleValues = useMemo(() => [scale0, scale1, scale2], [scale0, scale1, scale2]);
  const translateYValues = useMemo(
    () => [translateY0, translateY1, translateY2],
    [translateY0, translateY1, translateY2]
  );
  const opacityValues = useMemo(
    () => [opacity0, opacity1, opacity2],
    [opacity0, opacity1, opacity2]
  );

  // Reset the deck when a new data array is provided
  React.useEffect(() => {
    setCurrentIndex(0);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    for (let i = 0; i < Math.min(maxVisibleCards, scaleValues.length); i++) {
      scaleValues[i].value = withSpring(1 - i * 0.05);
      translateYValues[i].value = withSpring(i * cardSpacing);
      opacityValues[i].value = withSpring(1 - i * 0.1);
    }
  }, [data, cardSpacing, maxVisibleCards, scaleValues, translateYValues, opacityValues]);

  // Create animated styles for each card position
  const animatedStyle0 = useAnimatedStyle(() => ({
    transform: [{ scale: scale0.value }, { translateY: translateY0.value }],
    opacity: opacity0.value,
  }));

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }, { translateY: translateY1.value }],
    opacity: opacity1.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }, { translateY: translateY2.value }],
    opacity: opacity2.value,
  }));

  const animatedStyles = [animatedStyle0, animatedStyle1, animatedStyle2];
  const advanceIndex = useCallback(() => {
    const timeout = setTimeout(() => {
      let shouldNotify = false;
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= data.length) {
          shouldNotify = true;
        }
        return nextIndex;
      });
      if (shouldNotify) {
        onDeckEmpty?.();
      }
      // remove finished timeout reference
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== timeout);
    }, 300);
    timeoutsRef.current.push(timeout);
  }, [data.length, onDeckEmpty]);

  const handleSwipeLeft = useCallback(
    (item: SwipeDeckItem, index: number) => {
      onSwipeLeft?.(item, index);

      // Animate cards moving up in the stack
      for (let i = 0; i < Math.min(maxVisibleCards - 1, scaleValues.length); i++) {
        scaleValues[i].value = withSpring(1 - i * 0.05);
        translateYValues[i].value = withSpring(-(i * cardSpacing));
        opacityValues[i].value = withSpring(1 - i * 0.1);
      }

      advanceIndex();
      triggerCooldown();
    },
    [
      onSwipeLeft,
      scaleValues,
      translateYValues,
      opacityValues,
      maxVisibleCards,
      cardSpacing,
      advanceIndex,
    ]
  );
  const handleSwipeRight = useCallback(
    (item: SwipeDeckItem, index: number) => {
      onSwipeRight?.(item, index);

      // Animate cards moving up in the stack
      for (let i = 0; i < Math.min(maxVisibleCards - 1, scaleValues.length); i++) {
        scaleValues[i].value = withSpring(1 - i * 0.05);
        translateYValues[i].value = withSpring(-(i * cardSpacing));
        opacityValues[i].value = withSpring(1 - i * 0.1);
      }

      advanceIndex();
      triggerCooldown();
    },
    [
      onSwipeRight,
      scaleValues,
      translateYValues,
      opacityValues,
      maxVisibleCards,
      cardSpacing,
      advanceIndex,
    ]
  ); // Initialize animation values for the stack effect
  React.useEffect(() => {
    for (let index = 0; index < Math.min(maxVisibleCards, scaleValues.length); index++) {
      scaleValues[index].value = withDelay(index * 100, withSpring(1 - index * 0.05));
      translateYValues[index].value = withDelay(index * 100, withSpring(index * cardSpacing));
      opacityValues[index].value = withDelay(index * 100, withSpring(1 - index * 0.1));
    }
  }, [scaleValues, translateYValues, opacityValues, cardSpacing, maxVisibleCards]);

  const getVisibleCards = useCallback(() => {
    const cards = [];
    for (let i = 0; i < maxVisibleCards; i++) {
      const dataIndex = currentIndex + i;
      if (dataIndex < data.length) {
        cards.push({
          ...data[dataIndex],
          stackIndex: i,
          dataIndex,
        });
      }
    }
    return cards.reverse(); // Reverse so top card is rendered last
  }, [currentIndex, data, maxVisibleCards]);

  const visibleCards = getVisibleCards();

  if (currentIndex >= data.length) {
    return (
      <View
        className={cn('items-center justify-center', className)}
        style={{
          width: CONTAINER_WIDTH,
          height: CONTAINER_HEIGHT,
        }}></View>
    );
  }

  return (
    <View
      className={cn('items-center justify-center', className)}
      style={{
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
      }}>
      {visibleCards.map((card) => {
        const isTopCard = card.stackIndex === 0;
        const animIndex = Math.min(card.stackIndex, animatedStyles.length - 1);

        const animatedStyle = [
          animatedStyles[animIndex],
          { zIndex: maxVisibleCards - card.stackIndex },
        ];

        return (
          <Animated.View
            key={card.id}
            style={[
              {
                position: 'absolute',
              },
              animatedStyle,
            ]}>
            <SwipeCard
              imageUri={card.imageUri}
              onSwipeLeft={() => handleSwipeLeft(card, card.dataIndex)}
              onSwipeRight={() => handleSwipeRight(card, card.dataIndex)}
              disabled={!isTopCard}
              style={{
                shadowOpacity: isTopCard ? 0.3 : 0.1,
                shadowRadius: isTopCard ? 8 : 4,
              }}
            />
          </Animated.View>
        );
      })}
      {cooldown && <View pointerEvents="auto" style={{ position: 'absolute', inset: 0 }} />}
    </View>
  );
};
