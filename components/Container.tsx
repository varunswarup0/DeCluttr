import { StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '~/lib/useColorScheme';
import { COLORS } from '~/theme/colors';
import { px } from '~/lib/pixelPerfect';

export const Container = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme } = useColorScheme();
  const darkColors = [COLORS.dark.primary, COLORS.dark.background] as const;
  const lightColors = [COLORS.light.primary, COLORS.light.background] as const;
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  return (
    <LinearGradient colors={[...colors]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>{children}</SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: px(18),
  },
});
