import { Feather } from '@expo/vector-icons';
import { Text, View, StyleSheet } from 'react-native';
import { px } from '~/lib/pixelPerfect';

export const BackButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <View style={styles.backButton}>
      <Feather name="chevron-left" size={16} color="#007AFF" />
      <Text style={styles.backButtonText} onPress={onPress}>
        Back
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    paddingLeft: px(20),
  },
  backButtonText: {
    color: '#007AFF',
    marginLeft: px(4),
  },
});
