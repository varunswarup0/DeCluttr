import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { MOTIVATION_MESSAGES, createMessagePicker } from '~/lib/positiveMessages';

const MESSAGES = MOTIVATION_MESSAGES;
const pickMessage = createMessagePicker(MESSAGES);

export const MotivationBanner: React.FC = () => {
  const message = useMemo(() => pickMessage(), []);

  return (
    <View className="mb-4 rounded-xl bg-green-50 px-4 py-2 dark:bg-green-900">
      <Text className="text-center" color="secondary">
        {message}
      </Text>
    </View>
  );
};
