import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import GlobalHeader from "../src/components/layout/GlobalHeader"; // Disabled - moved to BottomMenu
import BottomMenu from "../src/components/layout/BottomMenu";
import SplashScreen from "../src/components/common/SplashScreen";
import { useAuth } from "../src/features/auth/hooks/useAuth";
import { AuthStatus } from "../src/features/auth/types/authTypes";
import { useForecastCacheStore } from "../src/features/forecast/stores/forecastCacheStore";
import { useFavoriteSpotsStore } from "../src/features/maps/stores/favoriteSpotsStore";
import { colors } from "../src/theme/colors";

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

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    // Fetch forecast immediately on mount (during splash)
    const fetchForecastOnSplash = async () => {
      if (forecastFetchedRef.current) return;
      forecastFetchedRef.current = true;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          // Fetch and cache forecast (won't fetch if cache is valid)
          await forecastActions.fetchAndCache(
            pos.coords.latitude,
            pos.coords.longitude
          );
          setForecastReady(true);
        } else {
          // No location permission, mark as ready anyway
          setForecastReady(true);
        }
      } catch (error) {
        // Silently fail - forecast will be fetched when needed
        console.log("🌊 Could not fetch forecast during splash:", error);
        setForecastReady(true); // Mark as ready even on error
      }
    };

    // Fetch favorite spots if user is authenticated
    const fetchFavoriteSpotsOnSplash = async () => {
      if (favoriteSpotsFetchedRef.current) return;
      if (status === AuthStatus.AUTHENTICATED) {
        favoriteSpotsFetchedRef.current = true;
        try {
          await favoriteSpotsActions.syncFromBackend();
        } catch (error) {
          console.error("Error fetching favorite spots:", error);
          // Don't block app startup on favorite spots error
        }
      }
    };

    fetchForecastOnSplash();
    fetchFavoriteSpotsOnSplash();
  }, [forecastActions, favoriteSpotsActions, status]);

  useEffect(() => {
    // Hide splash screen after animation AND forecast is ready (or max 5 seconds)
    const minSplashTime = 2000; // Minimum splash time (animation duration)
    const maxSplashTime = 5000; // Maximum splash time (don't wait forever)
    const startTime = Date.now();

    const checkAndHideSplash = () => {
      const elapsed = Date.now() - startTime;
      const shouldHide = forecastReady && elapsed >= minSplashTime;
      const mustHide = elapsed >= maxSplashTime;

      if (shouldHide || mustHide) {
        setShowSplash(false);
      } else {
        // Check again in 100ms
        setTimeout(checkAndHideSplash, 100);
      }
    };

    // Start checking after minimum splash time
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

  const handleHomePress = () => {
    router.push("/");
  };

  const handleMapPress = () => {
    router.push("/map");
  };

  const handleFishPress = () => {
    router.push("/camera");
  };

  const handleChatPress = () => {
    router.push("/community");
  };

  // Hide header and bottom menu for camera, review screens, and splash screen
  const isCameraScreen = pathname === "/camera" || pathname === "/review";
  // Hide only bottom menu for guide screens
  const isGuideScreen = pathname === "/guide/species";
  // Hide bottom menu for profile-related screens
  const isProfileScreen = pathname === "/adventures";
  // Hide bottom menu for chat room (but show for channel list)
  const isChatRoom = pathname.startsWith("/community/chat/") || pathname.startsWith("/community/direct-messages");

  const isAuthenticated = status === AuthStatus.AUTHENTICATED;
  // const showHeader = !isCameraScreen && !showSplash && isAuthenticated; // Disabled - moved to BottomMenu
  const showBottomMenu =
    !isCameraScreen &&
    !isGuideScreen &&
    !isProfileScreen &&
    !isChatRoom &&
    !showSplash &&
    isAuthenticated;

  if (
    showSplash ||
    status === AuthStatus.IDLE ||
    status === AuthStatus.CHECKING
  ) {
    return (
      <View style={styles.container}>
        <SplashScreen onFinish={() => setShowSplash(false)} />
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <>
        {/* {showHeader && <GlobalHeader />} */}
        {/* Disabled - moved to BottomMenu */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
});
