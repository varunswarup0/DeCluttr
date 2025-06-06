import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useRecycleBinStore } from '~/store/store';

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

  return (
    <View className="flex-row items-center rounded-full bg-yellow-100 px-3 py-1 dark:bg-yellow-900">
      <Text className="text-sm font-bold text-yellow-700 dark:text-yellow-300">⭐ {xp} XP</Text>
    </View>
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
