import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useRecycleBinStore } from '~/store/store';
import { ScoreHeader } from '~/components/ScoreHeader';
import { AudioToggle } from '~/components/AudioToggle';

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
          <View className="flex-row items-center gap-2 mr-1">
            <AudioToggle />
            <ScoreHeader />
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
