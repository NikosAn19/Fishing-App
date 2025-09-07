import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FishingMapView from "../src/components/MapView";

export default function MapPage() {
  const insets = useSafeAreaInsets();

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    Alert.alert(
      "Map Pressed",
      `Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`,
      [{ text: "OK" }]
    );
  };

  const handleMarkerPress = (marker: any) => {
    Alert.alert(marker.title, marker.description, [{ text: "OK" }]);
  };

  return (
    <View
      style={[
        styles.container,
        {
          marginTop: -5, // Small negative margin to overlap with header shadow
          paddingBottom: 85 + insets.bottom, // Bottom menu height + safe area
        },
      ]}
    >
      <FishingMapView
        onMapPress={handleMapPress}
        onMarkerPress={handleMarkerPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
