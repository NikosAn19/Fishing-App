import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../../theme/colors";
import { MessageCircle, UserPlus, UserCheck } from "lucide-react-native";
import { ProfileAvatar } from "./shared/ProfileAvatar";
import { ProfileStats } from "./shared/ProfileStats";
import { ProfileAchievements } from "./shared/ProfileAchievements";

interface PublicProfileViewProps {
  user: {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  onSendMessage: () => void;
  onAddFriend: () => void;
  isFriend?: boolean; // Can use this later for "Add" vs "Added" state
}

export function PublicProfileView({
  user,
  onSendMessage,
  onAddFriend,
  isFriend,
}: PublicProfileViewProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Spacer for custom back button since we removed default header */}
      <View style={{ height: 60 }} />

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Profile Image & Name Section */}
        <View style={styles.identitySection}>
          <ProfileAvatar 
            avatarUrl={user?.avatarUrl} 
            size={120}
          />
          <Text style={styles.userName}>
            {user?.displayName || "Χρήστης"}
          </Text>
          
          {/* Action Buttons - Under Name */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={onSendMessage}>
                <MessageCircle size={20} color={colors.accent} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onAddFriend}>
                {isFriend ? (
                    <UserCheck size={20} color={colors.accent} />
                ) : (
                    <UserPlus size={20} color={colors.accent} />
                )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Stat Cards - Replaces InfoCard */}
        <ProfileStats catchesCount={42} speciesCount={12} />

      </View>

      <ProfileAchievements />

      {/* Spacing at bottom */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  identitySection: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  actionButtonsContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 8,
  },
  actionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border
  },
  infoCard: {
    backgroundColor: colors.secondaryBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.tertiaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "600",
  },
});
