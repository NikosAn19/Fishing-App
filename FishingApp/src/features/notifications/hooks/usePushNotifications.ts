import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { apiFetchJson, JSON_HEADERS } from '../../../utils/apiClient';
import { notificationManager } from '../NotificationManager';
import { NotificationMessage } from '../types/NotificationMessages';

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      // 1. Use Centralized Permission Logic
      const hasPermission = await notificationManager.ensurePermissions();
      if (!hasPermission) {
        Alert.alert(NotificationMessage.PUSH_TOKEN_ERROR); // Use Enum
        return;
      }

      // 2. Get Token
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo Push Token:', token);
      } catch (e) {
        console.error('Error getting push token:', e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });

    // Listeners for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerTokenWithBackend = async (accessToken: string) => {
    if (expoPushToken) {
      try {
        // 3. Use Standard API Client (Automatic Auth header)
        // Note: apiFetchJson handles the base URL logic
        const response: any = await apiFetchJson('/api/friends/push-token', {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify({ token: expoPushToken }),
          skipAuth: false // Explicitly use auth
        });
        console.log('Push token registered with backend:', response);
      } catch (e) {
        console.error('Failed to register push token:', e);
      }
    }
  };

  return {
    expoPushToken,
    notification,
    registerTokenWithBackend
  };
}
