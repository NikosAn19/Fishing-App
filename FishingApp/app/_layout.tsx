import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import GlobalHeader from "../src/components/GlobalHeader";
import BottomMenu from "../src/components/BottomMenu";
import SplashScreen from "../src/components/SplashScreen";
import { useAuth } from "../src/features/auth/hooks/useAuth";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const { status, bootstrapSession } = useAuth();

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    // Hide splash screen after initial animation
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      if (pathname === "/login" || pathname === "/register") {
        requestAnimationFrame(() => router.replace("/"));
      }
    } else if (status === "unauthenticated" && !showSplash) {
      if (pathname !== "/login" && pathname !== "/register") {
        requestAnimationFrame(() => router.replace("/login"));
      }
    }
  }, [status, pathname, router, showSplash]);

  const handleMapPress = () => {
    router.push("/map");
  };

  const handleFishPress = () => {
    router.push("/camera");
  };

  const handleCatchesPress = () => {
    router.push("/catches");
  };

  // Hide header and bottom menu for camera, review screens, and splash screen
  const isCameraScreen = pathname === "/camera" || pathname === "/review";
  // Hide only bottom menu for guide screens
  const isGuideScreen = pathname === "/guide/species";
  const isAuthenticated = status === "authenticated";
  const showHeader = !isCameraScreen && !showSplash && isAuthenticated;
  const showBottomMenu =
    !isCameraScreen && !isGuideScreen && !showSplash && isAuthenticated;

  if (showSplash || status === "idle" || status === "checking") {
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
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <>
        {showHeader && <GlobalHeader />}
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Fishing App",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              title: "Profile",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="spots"
            options={{
              title: "Fishing Spots",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="map"
            options={{
              title: "Map",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="camera"
            options={{
              title: "Camera",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="review"
            options={{
              title: "Review Catch",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="guide/species"
            options={{
              title: "Species Guide",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="catches"
            options={{
              title: "My Catches",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="adventures"
            options={{
              title: "My Adventures",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "Settings",
              headerShown: false,
            }}
          />
        </Stack>
        {showBottomMenu && (
          <BottomMenu
            onMapPress={handleMapPress}
            onFishPress={handleFishPress}
            onCatchesPress={handleCatchesPress}
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
  },
});
