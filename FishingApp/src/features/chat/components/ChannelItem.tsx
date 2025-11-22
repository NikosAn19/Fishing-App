import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { Channel } from "../types";

interface ChannelItemProps {
  channel: Channel;
  onPress: (channel: Channel) => void;
}

export default function ChannelItem({ channel, onPress }: ChannelItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(channel)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="chatbubble-ellipses" size={20} color={colors.textSecondary} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name}># {channel.name}</Text>
          {channel.lastMessage && (
            <Text style={styles.timestamp}>
              {new Date(channel.lastMessage.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>
        
        {channel.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {channel.lastMessage.text}
          </Text>
        )}
      </View>

      {channel.unreadCount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {channel.unreadCount > 99 ? "99+" : channel.unreadCount}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.secondaryBg,
    marginBottom: 1, // separator
  },
  iconContainer: {
    marginRight: 12,
    opacity: 0.7,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  lastMessage: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
});
