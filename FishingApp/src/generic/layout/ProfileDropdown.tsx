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
import { colors } from "../../theme/colors";
import {
  PROFILE_MENU_ITEMS,
  ProfileMenuItem,
  ProfileMenuItemType,
} from "../../features/profile/types/profile";

import { useAuthStore } from "../../features/auth/stores/authStore";

interface ProfileDropdownProps {
  visible: boolean;
  onClose: () => void;
  anchorPosition: { x: number; y: number }; // x = right offset, y = bottom offset
  onLogout: () => void;
}

export default function ProfileDropdown({
  visible,
  onClose,
  anchorPosition,
  onLogout,
}: ProfileDropdownProps) {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { user } = useAuthStore();
  
  // Calculate pending requests count
  const pendingRequestsCount = React.useMemo(() => {
    return user?.friends?.filter(f => f.status === 'pending').length || 0;
  }, [user?.friends]);

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
            bottom: anchorPosition.y,
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
                
                {/* Notification Badge */}
                {item.type === ProfileMenuItemType.NOTIFICATIONS && pendingRequestsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                    </Text>
                  </View>
                )}

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
  badge: {
    backgroundColor: '#EF4444', 
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
