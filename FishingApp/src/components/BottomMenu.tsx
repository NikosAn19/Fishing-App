import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

interface BottomMenuProps {
  onMapPress?: () => void;
  onFishPress?: () => void;
  onCatchesPress?: () => void;
  currentScreen?: string;
}

export default function BottomMenu({
  onMapPress,
  onFishPress,
  onCatchesPress,
  currentScreen,
}: BottomMenuProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Background bar */}
      <View style={styles.menuBar}>
        {/* Map Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMapPress}
          disabled={!onMapPress}
        >
          <Ionicons
            name="map"
            size={24}
            color={currentScreen === "/map" ? colors.accent : colors.white}
          />
          <Text
            style={[
              styles.buttonText,
              {
                color: currentScreen === "/map" ? colors.accent : colors.white,
              },
            ]}
          >
            Map
          </Text>
        </TouchableOpacity>

        {/* Fish Button - Circular and protruding */}
        <TouchableOpacity
          style={styles.fishButton}
          onPress={onFishPress}
          disabled={!onFishPress}
        >
          <Ionicons name="fish" size={32} color={colors.accent} />
        </TouchableOpacity>

        {/* Catches Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onCatchesPress}
          disabled={!onCatchesPress}
        >
          <Ionicons
            name="list"
            size={24}
            color={currentScreen === "/catches" ? colors.accent : colors.white}
          />
          <Text
            style={[
              styles.buttonText,
              {
                color:
                  currentScreen === "/catches" ? colors.accent : colors.white,
              },
            ]}
          >
            Catches
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  menuBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  menuButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
  },
  fishButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  logoImage: {
    width: 50,
    height: 35,
  },
});
