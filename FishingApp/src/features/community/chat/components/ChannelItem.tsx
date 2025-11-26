import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Hash } from "lucide-react-native";
import { colors } from "../../../../theme/colors";
import { Channel } from "../types/chatTypes";

interface ChannelItemProps {
  channel: Channel;
  onPress: (channel: Channel) => void;
}

export default function ChannelItem({ channel, onPress }: ChannelItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(channel)}
      activeOpacity={0.9} // active:scale-[0.98] simulation
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Hash size={18} color={colors.palette.slate[500]} />
        </View>
        <Text style={styles.name}>{channel.name}</Text>
      </View>

      {/* Unread Badge */}
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
    justifyContent: "space-between",
    padding: 12, // p-3
    borderRadius: 12, // rounded-xl
    backgroundColor: "rgba(15, 23, 42, 0.4)", // bg-slate-900/40
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)", // border-slate-800/50
    marginBottom: 8, // Add some spacing between items since they are now cards
    marginHorizontal: 16, // Add horizontal margin to not touch screen edges
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // gap-3
  },
  iconContainer: {
    // group-hover logic is not directly applicable in RN without state, 
    // but we set the base color as requested
  },
  name: {
    color: colors.palette.slate[200], // text-slate-200
    fontSize: 14, // text-sm
    fontWeight: "500", // font-medium
  },
  badge: {
    backgroundColor: colors.palette.emerald[500], // bg-emerald-500
    borderRadius: 999, // rounded-full
    paddingHorizontal: 6, // px-1.5
    paddingVertical: 2, // py-0.5
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.palette.slate[900], // text-slate-900
    fontSize: 10, // text-[10px]
    fontWeight: "bold", // font-bold
  },
});
