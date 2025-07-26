import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackHeaderProps } from '@react-navigation/stack';
import { Text } from '~/components/nativewindui/Text';
import { px } from '~/lib/pixelPerfect';

export function AppHeader({ navigation, back, options }: StackHeaderProps) {
  const title =
    typeof options.headerTitle === 'string'
      ? options.headerTitle
      : options.title ?? '';
  const Right = options.headerRight ? options.headerRight({ tintColor: undefined }) : null;
  const iconName = options.presentation === 'modal' ? 'close' : 'arrow-back';
  return (
    <View style={styles.container}>
      {back ? (
        <Pressable onPress={navigation.goBack} testID="header-back" style={styles.side}>
          <Ionicons name={iconName} size={px(20)} color="rgb(var(--android-primary))" />
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
      <Text variant="heading" numberOfLines={1} testID="header-title" style={styles.title}>
        {title}
      </Text>
      <View style={styles.side}>{Right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: px(44),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: px(8),
  },
  side: {
    width: px(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});

export default AppHeader;
