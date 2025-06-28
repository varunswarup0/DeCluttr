import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { MOTIVATION_MESSAGES, createMessagePicker } from '~/lib/positiveMessages';

const MESSAGES = MOTIVATION_MESSAGES;
const pickMessage = createMessagePicker(MESSAGES);

export const MotivationBanner: React.FC = () => {
  const message = useMemo(() => pickMessage(), []);

  return (
    <View className="mb-4 rounded-lg bg-[rgb(var(--android-card))] px-3 py-1 shadow-md dark:bg-[rgb(var(--android-card))]">
      <Text className="text-center font-arcade text-sm" color="secondary">
        {message}
      </Text>
    </View>
  );
};
