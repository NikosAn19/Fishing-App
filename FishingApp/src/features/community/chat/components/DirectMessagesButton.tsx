import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MessageCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../../theme/colors";

interface DirectMessagesButtonProps {
  onPress: () => void;
  unreadCount?: number;
}

export default function DirectMessagesButton({ onPress, unreadCount = 0 }: DirectMessagesButtonProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.palette.slate[800], colors.palette.slate[900]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <MessageCircle size={24} color={colors.accent} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Direct Messages</Text>
              <Text style={styles.subtitle}>Private conversations</Text>
            </View>
          </View>
          
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.palette.slate[700],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(16, 185, 129, 0.1)", // emerald/10
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  textContainer: {
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
});
