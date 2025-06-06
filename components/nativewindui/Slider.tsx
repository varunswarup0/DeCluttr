import RNSlider from '@react-native-community/slider';

import { useColorScheme } from '~/lib/useColorScheme';
import { COLORS } from '~/theme/colors';

function Slider({
  thumbTintColor,
  minimumTrackTintColor,
  maximumTrackTintColor,
  ...props
}: React.ComponentPropsWithoutRef<typeof RNSlider>) {
  const { colors } = useColorScheme();
  return (
    <RNSlider
      thumbTintColor={thumbTintColor ?? COLORS.white}
      minimumTrackTintColor={minimumTrackTintColor ?? colors.primary}
      maximumTrackTintColor={maximumTrackTintColor ?? colors.primary}
      {...props}
    />
  );
}

export { Slider };
