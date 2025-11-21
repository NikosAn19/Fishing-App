import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import HamburgerMenu from "./HamburgerMenu";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "../../features/auth/hooks/useAuth";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface BottomMenuProps {
  onHomePress?: () => void;
  onMapPress?: () => void;
  onFishPress?: () => void;
  currentScreen?: string;
}

export default function BottomMenu({
  onHomePress,
  onMapPress,
  onFishPress,
  currentScreen,
}: BottomMenuProps) {
  const insets = useSafeAreaInsets();
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

  const handleProfilePress = () => {
    profileButtonRef.current?.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        const spacing = 8;

        // Calculate right offset from screen edge
        const rightOffset = screenWidth - (pageX + width);

        // Calculate bottom position: distance from screen bottom to button top + spacing
        // pageY is the top of the button, so we position dropdown above it
        const bottomPosition = screenHeight - pageY + spacing;

        setDropdownPosition({ x: rightOffset, y: bottomPosition });
        setShowProfileDropdown(true);
      }
    );
  };

  return (
    <>
      {/* Background bar */}
      <View style={[styles.menuBar, { paddingBottom: 6 + insets.bottom }]}>
        {/* Home Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onHomePress}
          disabled={!onHomePress}
        >
          <Ionicons
            name="home"
            size={24}
            color={currentScreen === "/" ? colors.accent : colors.white}
          />
          <Text
            style={[
              styles.buttonText,
              {
                color: currentScreen === "/" ? colors.accent : colors.white,
              },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Hamburger Menu Button */}
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color={colors.white} />
          <Text style={styles.buttonText}>Menu</Text>
        </TouchableOpacity>

        {/* Fish Button - Circular and protruding */}
        <TouchableOpacity
          style={styles.fishButton}
          onPress={onFishPress}
          disabled={!onFishPress}
        >
          <Ionicons name="fish" size={32} color={colors.accent} />
        </TouchableOpacity>

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

        {/* Profile Icon */}
        <View ref={profileButtonRef} collapsable={false}>
          <TouchableOpacity
            style={styles.menuButton}
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
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
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
      />
    </>
  );
}

const styles = StyleSheet.create({
  menuBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    zIndex: 1000,
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
    paddingVertical: 4,
    minWidth: 60,
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
    marginHorizontal: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
});
