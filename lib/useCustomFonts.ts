import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

export function useCustomFonts() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    PressStart2P_400Regular,
  });
  return loaded;
}
