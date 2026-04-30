import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/src/store/useAuthStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      loadFromStorage().finally(() => SplashScreen.hideAsync());
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)"    options={{ headerShown: false }} />
        <Stack.Screen name="(auth)"    options={{ headerShown: false }} />
        <Stack.Screen name="search"    options={{ headerShown: false }} />
        <Stack.Screen name="booking/[scheduleId]"    options={{ headerShown: false }} />
        <Stack.Screen name="booking/confirmation/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="tracking/[scheduleId]"   options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
