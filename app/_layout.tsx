import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { TaskProvider } from '@/contexts/TaskContext';
import { UserProvider } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const isExpoGoAndroid = Platform.OS === 'android' && Constants.appOwnership === 'expo';
    if (isExpoGoAndroid) {
      return;
    }

    let subscription: { remove: () => void } | undefined;

    const redirectFromNotification = (notification: any) => {
      const url = notification.request.content.data?.url;

      if (typeof url === 'string') {
        router.push(url as never);
      }
    };

    const registerNotificationListeners = async () => {
      try {
        const Notifications = await import('expo-notifications');

        if (!Notifications.getLastNotificationResponseAsync || !Notifications.addNotificationResponseReceivedListener) {
          return;
        }

        const response = await Notifications.getLastNotificationResponseAsync();
        if (response?.notification) {
          redirectFromNotification(response.notification);
        }

        subscription = Notifications.addNotificationResponseReceivedListener(response => {
          redirectFromNotification(response.notification);
        });
      } catch (error) {
        console.warn('Notification listeners unavailable in this build:', error);
      }
    };

    void registerNotificationListeners();

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <TaskProvider>
      <UserProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </UserProvider>
    </TaskProvider>
  );
}
