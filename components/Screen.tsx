import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '~/lib/useColorScheme';
import { COLORS } from '~/theme/colors';
import { px } from '~/lib/pixelPerfect';
import React from 'react';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function Screen({ children, style }: ScreenProps) {
  const { colorScheme } = useColorScheme();
  const darkColors = [COLORS.dark.primary, COLORS.dark.background] as const;
  const lightColors = [COLORS.light.primary, COLORS.light.background] as const;
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  return (
    <LinearGradient colors={[...colors]} style={styles.gradient}>
      <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: px(18) },
});

export default Screen;
