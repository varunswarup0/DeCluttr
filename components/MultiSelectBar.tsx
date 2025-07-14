import React from 'react';
import { View } from 'react-native';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { px } from '~/lib/pixelPerfect';

interface MultiSelectBarProps {
  count: number;
  onCancel: () => void;
  onDelete: () => void;
}

export const MultiSelectBar: React.FC<MultiSelectBarProps> = ({ count, onCancel, onDelete }) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: px(16),
        right: px(16),
        bottom: px(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      pointerEvents="box-none">
      <Button size="lg" variant="secondary" onPress={onCancel}>
        <Text>Cancel</Text>
      </Button>
      <Button size="lg" onPress={onDelete}>
        <Text>{`Delete (${count})`}</Text>
      </Button>
    </View>
  );
};

export default MultiSelectBar;
