import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useEffect, useRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRecycleBinStore } from '~/store/store';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';

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
  const prevLevel = useRef(Math.floor(xp / 100) + 1);

  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;

  // Trigger a brief scale animation whenever XP changes.
  // Reanimated shared values are stable, so including `scale` is safe here.
  useEffect(() => {
    scale.value = 1.4;
    scale.value = withTiming(1, { duration: 300 });

    if (level > prevLevel.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    prevLevel.current = level;
  }, [xp, level, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="w-28 items-center rounded-full bg-yellow-100 px-3 py-1 dark:bg-yellow-900">
      <Text className="font-arcade text-xs text-yellow-700 dark:text-yellow-300">
        ⭐ Lv {level} • {xp} XP
      </Text>
      <ProgressIndicator value={progress} className="mt-1" />
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => <XPDisplay />,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recycle-bin"
        options={{
          title: 'Recycle Bin',
          tabBarIcon: ({ color, size }) => <RecycleBinTabIcon color={color} size={size} />,
        }}
      />
      {/**
       * Extra tabs removed for a leaner experience. Only Home and Recycle Bin remain.
       */}
    </Tabs>
  );
}
