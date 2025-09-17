import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../theme/colors";
import HamburgerMenu from "./HamburgerMenu";

interface GlobalHeaderProps {
  onProfilePress?: () => void;
}

export default function GlobalHeader({ onProfilePress }: GlobalHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  const handleLogoPress = () => {
    router.push("/");
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primaryBg}
        />
        <View style={styles.header}>
          {/* Hamburger Menu */}
          <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
            <Ionicons name="menu" size={24} color={colors.white} />
          </TouchableOpacity>

          {/* Logo */}
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={handleLogoPress}
          >
            <Text style={styles.logoText}>Psaraki</Text>
          </TouchableOpacity>

          {/* Profile Icon */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={onProfilePress}
            disabled={!onProfilePress}
          >
            <Ionicons name="person-circle" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hamburger Menu Modal */}
      <HamburgerMenu visible={isMenuVisible} onClose={handleCloseMenu} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryBg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  profileButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 1,
  },
});
