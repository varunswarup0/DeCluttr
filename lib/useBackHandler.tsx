import { useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';

export function useBackHandler() {
  const navigation = useNavigation();
  const isAtRoot = useNavigationState((state) => state.index === 0);

  useEffect(() => {
    const onPress = () => {
      if (!isAtRoot) {
        navigation.goBack();
        return true;
      }
      Alert.alert('Hold on!', 'Are you sure you want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onPress);
    return () => sub.remove();
  }, [isAtRoot, navigation]);
}
