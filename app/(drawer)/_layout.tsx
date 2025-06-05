import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

const DrawerLayout = () => (
  <Drawer>
    <Drawer.Screen
      name="(tabs)"
      options={{
        headerTitle: 'Decluttr',
        drawerLabel: 'Home',
        drawerIcon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />,
        headerRight: () => <></>,
      }}
    />
    {/**
     * Extra screens like Profile and Stats were removed to keep the game simple
     * and reduce potential bugs. Only the main game and recycle bin remain.
     */}
  </Drawer>
);

export default DrawerLayout;
