import { StyleSheet, SafeAreaView } from 'react-native';
import { px } from '~/lib/pixelPerfect';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: px(18),
  },
});
