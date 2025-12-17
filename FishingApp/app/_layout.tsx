import "../src/polyfills";
import "react-native-get-random-values";
import { Buffer } from "buffer";
global.Buffer = Buffer;

import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
// Removed AppRepository (unused)
// Removed useChatStore (unused now)
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomMenu from "../src/generic/layout/BottomMenu";
import FactSplashScreen from "../src/features/splash/screens/FactSplashScreen";
import { useAuth } from "../src/features/auth/hooks/useAuth";
import { AuthStatus } from "../src/features/auth/types/authTypes";
import { useForecastCacheStore } from "../src/features/forecast/stores/forecastCacheStore";
import { useFavoriteSpotsStore } from "../src/features/maps/stores/favoriteSpotsStore";
import { colors } from "../src/theme/colors";
import { usePushNotifications } from "../src/features/notifications/hooks/usePushNotifications";
import { useAuthStore } from "../src/features/auth/stores/authStore";
import { useLocationStore } from "../src/features/location/stores/locationStore";
import { notificationManager } from "../src/features/notifications";
import { useChatNotifications } from "../src/features/notifications/hooks/useChatNotifications";
import { AlertProvider } from "../src/context/AlertContext";
import { AlertModal } from "../src/generic/common/alerts/AlertModal";

// Configure notifications to show even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [showSplash, setShowSplash] = useState(true);
  const [forecastReady, setForecastReady] = useState(false);
  const { status, bootstrapSession } = useAuth();
  const { actions: forecastActions } = useForecastCacheStore();
  const { actions: favoriteSpotsActions } = useFavoriteSpotsStore();
  const forecastFetchedRef = useRef(false);
  const favoriteSpotsFetchedRef = useRef(false);
  
  // Push Notifications
  const { expoPushToken, registerTokenWithBackend } = usePushNotifications();

  // New: Use extracted hook for In-App Chat Notifications
  useChatNotifications({ authStatus: status });

  // Push Notifications Setup (Existing)
  


  // Push Notifications Setup (Existing)
  useEffect(() => {
    if (status === AuthStatus.AUTHENTICATED && expoPushToken) {
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken) {
            registerTokenWithBackend(accessToken);
        }
    }
  }, [status, expoPushToken]);

  // Handle Notification Tap
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      notificationManager.handleNotificationResponse(response, router);
    });
    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    // Fetch forecast immediately on mount (during splash)
    const fetchForecastOnSplash = async () => {
      if (forecastFetchedRef.current) return;
      forecastFetchedRef.current = true;

      try {
        // Permissions...
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          useLocationStore.getState().setCoords(pos.coords.latitude, pos.coords.longitude);

          await forecastActions.fetchAndCache(
            pos.coords.latitude,
            pos.coords.longitude
          );
          setForecastReady(true);
        } else {
          setForecastReady(true);
        }
      } catch (error) {
        console.log("🌊 Could not fetch forecast during splash:", error);
        setForecastReady(true);
      }
    };

    const fetchFavoriteSpotsOnSplash = async () => {
      if (favoriteSpotsFetchedRef.current) return;
      if (status === AuthStatus.AUTHENTICATED) {
        favoriteSpotsFetchedRef.current = true;
        try {
          await favoriteSpotsActions.syncFromBackend();
        } catch (error) {
          console.error("Error fetching favorite spots:", error);
        }
      }
    };

    fetchForecastOnSplash();
    fetchFavoriteSpotsOnSplash();
  }, [forecastActions, favoriteSpotsActions, status]);

  useEffect(() => {
    const minSplashTime = 2000;
    const maxSplashTime = 5000;
    const startTime = Date.now();

    const checkAndHideSplash = () => {
      const elapsed = Date.now() - startTime;
      const shouldHide = forecastReady && elapsed >= minSplashTime;
      const mustHide = elapsed >= maxSplashTime;

      if (shouldHide || mustHide) {
        setShowSplash(false);
      } else {
        setTimeout(checkAndHideSplash, 100);
      }
    };

    const timer = setTimeout(checkAndHideSplash, minSplashTime);
    return () => clearTimeout(timer);
  }, [forecastReady]);

  useEffect(() => {
    if (status === AuthStatus.AUTHENTICATED) {
      if (pathname === "/login" || pathname === "/register") {
        requestAnimationFrame(() => router.replace("/"));
      }
    } else if (status === AuthStatus.UNAUTHENTICATED && !showSplash) {
      if (pathname !== "/login" && pathname !== "/register") {
        requestAnimationFrame(() => router.replace("/login"));
      }
    }
  }, [status, pathname, router, showSplash]);

  const handleHomePress = () => router.push("/");
  const handleMapPress = () => router.push("/map");
  const handleFishPress = () => router.push("/camera");
  const handleChatPress = () => router.push("/community");

  const isCameraScreen = pathname === "/camera" || pathname === "/review";
  const isGuideScreen = pathname === "/guide/species";
  const isProfileScreen = pathname === "/adventures";
  const isChatRoom = pathname.startsWith("/community/chat/") || pathname.startsWith("/community/direct-messages");

  const isAuthenticated = status === AuthStatus.AUTHENTICATED;
  const isStoryScreen = pathname.startsWith("/community/stories");

  const showBottomMenu =
    !isCameraScreen &&
    !isGuideScreen &&
    !isProfileScreen &&
    !isChatRoom &&
    !isStoryScreen &&
    !showSplash &&
    isAuthenticated;

  if (
    showSplash ||
    status === AuthStatus.IDLE ||
    status === AuthStatus.CHECKING
  ) {
    return (
      <View style={styles.container}>
        <FactSplashScreen onFinish={() => setShowSplash(false)} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    );
  }



// ... existing code ...

  return (
    <AlertProvider>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <>
          <Stack screenOptions={{ headerShown: false }} />
          {showBottomMenu && (
            <BottomMenu
              onHomePress={handleHomePress}
              onMapPress={handleMapPress}
              onFishPress={handleFishPress}
              onChatPress={handleChatPress}
              currentScreen={pathname}
            />
          )}
        </>
        <AlertModal />
      </View>
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
});
