import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { SwipeCard } from './SwipeCard';
import { cn } from '~/lib/cn';

import { px } from '~/lib/pixelPerfect';

const { width: screenWidth } = Dimensions.get('window');
const DECK_WIDTH = px(screenWidth * 0.9);
const DECK_HEIGHT = px(screenWidth * 1.2);
// Delay before the next card becomes interactive (ms)
// Lower values reduce perceived lag after swipes
const ADVANCE_DELAY = 10;
const STACK_DELAY = 10;

export interface SwipeDeckItem {
  id: string;
  imageUri: string;
}

export interface SwipeDeckProps {
  data: SwipeDeckItem[];
  onSwipeLeft?: (item: SwipeDeckItem, index: number, fast: boolean) => void;
  onSwipeRight?: (item: SwipeDeckItem, index: number, fast: boolean) => void;
  onDeckEmpty?: () => void;
  /** Called when a card is long pressed */
  onCardLongPress?: (item: SwipeDeckItem, index: number) => void;
  /** Set of selected card ids for highlighting */
  selectedIds?: Set<string>;
  maxVisibleCards?: number;
  cardSpacing?: number;
  className?: string;
}

export interface SwipeDeckHandle {
  swipeLeft: () => void;
  swipeRight: () => void;
}

export const SwipeDeck = forwardRef<SwipeDeckHandle, SwipeDeckProps>(
  (
    {
      data,
      onSwipeLeft,
      onSwipeRight,
      onDeckEmpty,
      onCardLongPress,
      selectedIds,
      maxVisibleCards = 3,
      cardSpacing = px(8),
      className,
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inputBlocked, setInputBlocked] = useState(false);
    const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
    const blockTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clear any pending timeouts on unmount or data reset
    React.useEffect(() => {
      return () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        if (blockTimeoutRef.current) {
          clearTimeout(blockTimeoutRef.current);
        }
      };
    }, []);

    // Create animation values for each card position in the stack
    const visibleCountRef = React.useRef(maxVisibleCards);
    const scaleValues = useMemo(
      () =>
        Array.from({ length: visibleCountRef.current }, (_, i) =>
          useSharedValue(1 - i * 0.05)
        ),
      []
    );
    const translateYValues = useMemo(
      () =>
        Array.from({ length: visibleCountRef.current }, () =>
          useSharedValue(0)
        ),
      []
    );
    const opacityValues = useMemo(
      () =>
        Array.from({ length: visibleCountRef.current }, (_, i) =>
          useSharedValue(1 - i * 0.1)
        ),
      []
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

    // Notify when there are no cards to show
    const emptyNotified = React.useRef(false);
    React.useEffect(() => {
      if (data.length === 0) {
        if (!emptyNotified.current) {
          onDeckEmpty?.();
          emptyNotified.current = true;
        }
      } else {
        emptyNotified.current = false;
      }
    }, [data.length, onDeckEmpty]);

    // Create animated styles for each card position
    const animatedStyles = useMemo(
      () =>
        scaleValues.map((_, i) =>
          useAnimatedStyle(() => ({
            transform: [
              { scale: scaleValues[i].value },
              { translateY: translateYValues[i].value },
            ],
            opacity: opacityValues[i].value,
          }))
        ),
      [scaleValues, translateYValues, opacityValues]
    );
    const advanceIndex = useCallback(() => {
      setInputBlocked(true);
      if (blockTimeoutRef.current) {
        clearTimeout(blockTimeoutRef.current);
      }
      blockTimeoutRef.current = setTimeout(() => {
        setInputBlocked(false);
      }, ADVANCE_DELAY);
      const timeout = setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= data.length && onDeckEmpty) {
            onDeckEmpty();
          }
          return nextIndex;
        });
        // remove finished timeout reference
        timeoutsRef.current = timeoutsRef.current.filter((t) => t !== timeout);
      }, ADVANCE_DELAY);
      timeoutsRef.current.push(timeout);
    }, [data.length, onDeckEmpty]);

    const handleSwipeLeft = useCallback(
      (item: SwipeDeckItem, index: number, fast: boolean) => {
        if (inputBlocked) return;
        onSwipeLeft?.(item, index, fast);

        // Animate cards moving up in the stack
        for (let i = 0; i < Math.min(maxVisibleCards - 1, scaleValues.length); i++) {
          scaleValues[i].value = withSpring(1 - i * 0.05);
          translateYValues[i].value = withSpring(-(i * cardSpacing));
          opacityValues[i].value = withSpring(1 - i * 0.1);
        }

        advanceIndex();
      },
      [
        inputBlocked,
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
      (item: SwipeDeckItem, index: number, fast: boolean) => {
        if (inputBlocked) return;
        onSwipeRight?.(item, index, fast);

        // Animate cards moving up in the stack
        for (let i = 0; i < Math.min(maxVisibleCards - 1, scaleValues.length); i++) {
          scaleValues[i].value = withSpring(1 - i * 0.05);
          translateYValues[i].value = withSpring(-(i * cardSpacing));
          opacityValues[i].value = withSpring(1 - i * 0.1);
        }

        advanceIndex();
      },
      [
        inputBlocked,
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
        scaleValues[index].value = withDelay(index * STACK_DELAY, withSpring(1 - index * 0.05));
        translateYValues[index].value = withDelay(
          index * STACK_DELAY,
          withSpring(index * cardSpacing)
        );
        opacityValues[index].value = withDelay(index * STACK_DELAY, withSpring(1 - index * 0.1));
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

    useImperativeHandle(
      ref,
      () => ({
        swipeLeft: () => {
          const card = getVisibleCards()[0];
          if (card) {
            handleSwipeLeft(card, card.dataIndex, false);
          }
        },
        swipeRight: () => {
          const card = getVisibleCards()[0];
          if (card) {
            handleSwipeRight(card, card.dataIndex, false);
          }
        },
      }),
      [getVisibleCards, handleSwipeLeft, handleSwipeRight]
    );

    if (currentIndex >= data.length) {
      return (
        <View
          className={cn('items-center justify-center', className)}
          style={{
            width: DECK_WIDTH,
            height: DECK_HEIGHT,
          }}></View>
      );
    }

    return (
      <View
        className={cn('items-center justify-center', className)}
        style={{
          width: DECK_WIDTH,
          height: DECK_HEIGHT,
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
                onSwipeLeft={(fast) => handleSwipeLeft(card, card.dataIndex, fast)}
                onSwipeRight={(fast) => handleSwipeRight(card, card.dataIndex, fast)}
                onLongPress={() => onCardLongPress?.(card, card.dataIndex)}
                selected={selectedIds?.has(card.id)}
                disabled={!isTopCard || inputBlocked}
                style={{
                  shadowOpacity: isTopCard ? 0.3 : 0.1,
                  shadowRadius: isTopCard ? 8 : 4,
                }}
              />
            </Animated.View>
          );
        })}
        {inputBlocked && <View pointerEvents="auto" style={{ position: 'absolute', inset: 0 }} />}
      </View>
    );
  }
);
