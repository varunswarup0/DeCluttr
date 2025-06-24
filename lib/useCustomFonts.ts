import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { Bungee_400Regular } from '@expo-google-fonts/bungee';
import { UnifrakturCook_700Bold } from '@expo-google-fonts/unifrakturcook';

export function useCustomFonts() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    PressStart2P_400Regular,
    VT323_400Regular,
    Bungee_400Regular,
    UnifrakturCook_700Bold,
  });
  return loaded;
}
