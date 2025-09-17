import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import GlobalHeader from "../src/components/GlobalHeader";
import BottomMenu from "../src/components/BottomMenu";
import SplashScreen from "../src/components/SplashScreen";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2.5 seconds (slightly longer than splash screen duration)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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
  const showHeader = !isCameraScreen && !showSplash;
  const showBottomMenu = !isCameraScreen && !isGuideScreen && !showSplash;

  return (
    <View style={styles.container}>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
