import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.tint,
            tabBarButton: HapticTab,
          }}
          initialRouteName="home"
        >
          <Tabs.Screen
            name="home"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="house.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="plants"
            options={{
              title: 'Plants',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="0.circle" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="wifi"
            options={{
              title: 'Wi-Fi',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="wifi" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="plant-detail"
            options={{
              href: null, // Hide from tab bar
            }}
          />
          <Tabs.Screen
            name="modal"
            options={{
              href: null, // Hide from tab bar
            }}
          />
        </Tabs>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
