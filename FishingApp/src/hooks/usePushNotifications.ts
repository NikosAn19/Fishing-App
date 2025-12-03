import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { API_BASE } from '../config/api';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  // const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const [notification, setNotification] = useState<any | undefined>();
  // const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  // const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const notificationListener = useRef<any | null>(null);
  const responseListener = useRef<any | null>(null);

  async function registerForPushNotificationsAsync() {
    let token;
    
    // NOTE: Push notifications are disabled in Expo Go for Android (SDK 53+)
    // Uncomment this code when using a Development Build
    /*
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }
      
      try {
          // Check if running in Expo Go
          if (Constants.appOwnership === 'expo') {
            console.log('Running in Expo Go - Skipping Push Notification Token fetch');
            return;
          }

          const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
          if (!projectId) {
              console.warn('Project ID not found. Push notifications require a Project ID.');
              console.warn('Please run "npx eas-cli init" to configure your project.');
              // We can't get a token without a project ID
              return;
          }
          token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
          console.log('Expo Push Token:', token);
      } catch (e) {
          console.error('Error getting push token:', e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }
    */
    console.log('Push Notifications disabled in Expo Go');
    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
        setExpoPushToken(token);
    });

    // notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    //   setNotification(notification);
    // });

    // responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    //   console.log('Notification response:', response);
    // });

    return () => {
      // notificationListener.current &&
      //   notificationListener.current.remove();
      // responseListener.current &&
      //   responseListener.current.remove();
    };
  }, []);

  const registerTokenWithBackend = async (accessToken: string) => {
      if (expoPushToken) {
          try {
              const response = await fetch(`${API_BASE}/api/friends/push-token`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${accessToken}`
                  },
                  body: JSON.stringify({ token: expoPushToken })
              });
              console.log('Push token registered with backend:', response.status);
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
