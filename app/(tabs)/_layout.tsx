import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useEffect, useRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useRecycleBinStore } from '~/store/store';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { successNotification } from '~/lib/haptics';

function RecycleBinTabIcon({ color, size }: { color: string; size: number }) {
  const { deletedPhotos } = useRecycleBinStore();

  return (
    <View className="relative">
      <Ionicons name="trash" size={size} color={color} />
      {deletedPhotos.length > 0 && (
        <View className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-red-500">
          <Text className="text-xs font-bold text-white" style={{ fontSize: 10 }}>
            {deletedPhotos.length > 99 ? '99+' : deletedPhotos.length}
          </Text>
        </View>
      )}
    </View>
  );
}

function XPDisplay() {
  const { xp } = useRecycleBinStore();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const prevLevel = useRef(Math.floor(xp / 100) + 1);

  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;

  // Animate XP display only when leveling up
  useEffect(() => {
    const leveledUp = level > prevLevel.current;
    if (leveledUp) {
      scale.value = 1.8;
      rotate.value = 15;
      scale.value = withTiming(1, { duration: 300 });
      rotate.value = withTiming(0, { duration: 300 });
      successNotification();
    }
    prevLevel.current = level;
  }, [xp, level, scale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="items-center rounded-full bg-[rgb(var(--android-xp)/0.2)] px-3 py-1 dark:bg-[rgb(var(--android-xp)/0.3)]">
      <Text className="font-arcade text-xs text-[rgb(var(--android-xp))]">
        ⭐ Lv {level} • {xp} XP
      </Text>
      <ProgressIndicator value={progress} className="mt-1 bg-[rgb(var(--android-xp))]" />
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerRight: () => <XPDisplay />,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recycle-bin"
        options={{
          tabBarIcon: ({ color, size }) => <RecycleBinTabIcon color={color} size={size} />,
        }}
      />
      {/**
       * Extra tabs removed for a leaner experience. Only Home and Recycle Bin remain.
       */}
    </Tabs>
  );
}
