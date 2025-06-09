import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';

const MESSAGES = [
  'Great job keeping your gallery tidy!',
  'Every swipe counts toward a cleaner phone!',
  'You\'re doing awesome, keep it up!',
  'Nice work! Your photos appreciate the love.',
];

export const MotivationBanner: React.FC = () => {
  const message = useMemo(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    []
  );

  return (
    <View className="mb-4 rounded-xl bg-green-50 px-4 py-2 dark:bg-green-900">
      <Text className="text-center" color="secondary">
        {message}
      </Text>
    </View>
  );
};
