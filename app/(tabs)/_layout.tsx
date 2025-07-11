import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useRecycleBinStore } from '~/store/store';
import { AudioToggle } from '~/components/AudioToggle';
import { ZenToggle } from '~/components/ZenToggle';

function RecycleBinTabIcon({ color, size }: { color: string; size: number }) {
  const { deletedPhotos } = useRecycleBinStore();

  return (
    <View className="relative">
      <Ionicons name="trash" size={size} color={color} />
      {deletedPhotos.length > 0 && (
        <View className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerRight: () => (
          <View className="mr-1 flex-row items-center gap-2">
            <ZenToggle />
            <AudioToggle />
          </View>
        ),
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
        name="analysis"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="videocam" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recycle-bin"
        options={{
          tabBarIcon: ({ color, size }) => <RecycleBinTabIcon color={color} size={size} />,
        }}
      />
      {/**
       * Extra tabs removed for a leaner experience. Home, Scan, Videos and Recycle Bin remain.
       */}
    </Tabs>
  );
}
