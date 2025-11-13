import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../theme/colors";
import {
  PROFILE_MENU_ITEMS,
  ProfileMenuItem,
  ProfileMenuItemType,
} from "../types/profile";

interface ProfileDropdownProps {
  visible: boolean;
  onClose: () => void;
  anchorPosition: { x: number; y: number }; // x = right offset, y = top offset
  onLogout: () => void;
  userName?: string | null;
  userEmail?: string | null;
}

export default function ProfileDropdown({
  visible,
  onClose,
  anchorPosition,
  onLogout,
  userName,
  userEmail,
}: ProfileDropdownProps) {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const handleItemPress = (item: ProfileMenuItem) => {
    onClose();
    if (item.type === ProfileMenuItemType.LOGOUT) {
      onLogout();
      return;
    }
    router.push(item.route as any);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Dropdown */}
      <Animated.View
        style={[
          styles.dropdown,
          {
            top: anchorPosition.y,
            right: anchorPosition.x,
            opacity: fadeAnim,
            transform: [
              {
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.dropdownContent}>
          <View style={styles.profileSummary}>
            <Ionicons
              name="person-circle"
              size={36}
              color={colors.accent}
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryName}>
                {userName || "Ο λογαριασμός μου"}
              </Text>
              {userEmail ? (
                <Text style={styles.summaryEmail}>{userEmail}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.divider} />
          {PROFILE_MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.type}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={colors.white}
                  style={styles.icon}
                />
                <Text style={styles.label}>{item.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.5)"
                  style={styles.chevron}
                />
              </TouchableOpacity>
              {index < PROFILE_MENU_ITEMS.length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 999,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: colors.secondaryBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  profileSummary: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  summaryName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  summaryEmail: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  icon: {
    width: 28,
    marginRight: 12,
  },
  label: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  chevron: {
    marginLeft: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.overlay10,
    marginHorizontal: 20,
  },
});
