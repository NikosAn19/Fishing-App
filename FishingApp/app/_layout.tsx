import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import GlobalHeader from "../src/components/GlobalHeader";
import BottomMenu from "../src/components/BottomMenu";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const handleMapPress = () => {
    router.push("/map");
  };

  const handleFishPress = () => {
    router.push("/camera");
  };

  const handleCatchesPress = () => {
    console.log("Catches button pressed");
  };

  // Hide header and bottom menu for camera and review screens
  const isCameraScreen = pathname === "/camera" || pathname === "/review";
  // Hide only bottom menu for guide screens
  const isGuideScreen = pathname === "/guide/species";
  const showHeader = !isCameraScreen;
  const showBottomMenu = !isCameraScreen && !isGuideScreen;

  return (
    <View style={styles.container}>
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
      </Stack>
      {showBottomMenu && (
        <BottomMenu
          onMapPress={handleMapPress}
          onFishPress={handleFishPress}
          onCatchesPress={handleCatchesPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
