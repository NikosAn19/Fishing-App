import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "../theme/colors";
import HamburgerMenu from "./HamburgerMenu";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "../features/auth/hooks/useAuth";

const { width: screenWidth } = Dimensions.get("window");

interface GlobalHeaderProps {
  onProfilePress?: () => void;
}

export default function GlobalHeader({ onProfilePress }: GlobalHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const profileButtonRef = useRef<View>(null);
  const { user, logout } = useAuth();

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  const handleLogoPress = () => {
    router.push("/");
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
      return;
    }

    profileButtonRef.current?.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        const dropdownWidth = 220;
        const spacing = 8;

        // Calculate right offset from screen edge
        const rightOffset = screenWidth - (pageX + width);
        const anchorY = pageY + height + spacing;

        setDropdownPosition({ x: rightOffset, y: anchorY });
        setShowProfileDropdown(true);
      }
    );
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
          <View ref={profileButtonRef} collapsable={false}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfilePress}
            >
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {(
                      user?.displayName?.[0] ||
                      user?.email?.[0] ||
                      "P"
                    ).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Hamburger Menu Modal */}
      <HamburgerMenu visible={isMenuVisible} onClose={handleCloseMenu} />

      {/* Profile Dropdown */}
      <ProfileDropdown
        visible={showProfileDropdown}
        onClose={() => setShowProfileDropdown(false)}
        anchorPosition={dropdownPosition}
        onLogout={logout}
        userName={user?.displayName}
        userEmail={user?.email}
      />
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: colors.white,
    fontWeight: "700",
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
