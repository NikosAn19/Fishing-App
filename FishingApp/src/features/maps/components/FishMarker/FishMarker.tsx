import React from "react";
import { View, StyleSheet, Image } from "react-native";

// Import the custom marker image
// Path relative to: src/features/maps/components/FishMarker/FishMarker.tsx
const markerImage = require("../../../../../assets/images/custom-marker-removebg-preview.png");

interface FishMarkerProps {
  size?: number;
}

export default function FishMarker({ size = 64 }: FishMarkerProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={markerImage}
        style={{ width: "100%", height: "100%" }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
