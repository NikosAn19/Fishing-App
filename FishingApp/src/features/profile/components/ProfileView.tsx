import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../theme/colors";
import {
  User,
  Mail,
  Edit3,
  Check,
  X,
} from "lucide-react-native";
import { ProfileAvatar } from "./shared/ProfileAvatar";
import { ProfileStats } from "./shared/ProfileStats";
import { ProfileAchievements } from "./shared/ProfileAchievements";

interface ProfileViewProps {
  user: {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  isEditing: boolean;
  onEditStart?: () => void;
  onEditCancel?: () => void;
  onEditSave?: () => void;
  isUpdating?: boolean;
  displayName: string;
  onDisplayNameChange: (text: string) => void;
  isUploadingAvatar?: boolean;
  onAvatarPress?: () => void;
  showEditButton?: boolean;
  headerRight?: React.ReactNode;
}

export function ProfileView({
  user,
  isEditing,
  onEditStart,
  onEditCancel,
  onEditSave,
  isUpdating = false,
  displayName,
  onDisplayNameChange,
  isUploadingAvatar = false,
  onAvatarPress,
  showEditButton = true,
  headerRight,
}: ProfileViewProps) {
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header - No Title, just Actions */}
      <View style={styles.header}>
        <View /> {/* Spacer for flex-between */}
        
        {headerRight ? headerRight : showEditButton && (
          !isEditing ? (
            <TouchableOpacity
              onPress={onEditStart}
              style={styles.editButton}
            >
              <Edit3 size={20} color={colors.accent} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={onEditCancel}
                style={styles.cancelButton}
              >
                <X size={20} color={colors.textSecondary} strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onEditSave}
                style={styles.saveButton}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Check size={20} color={colors.white} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            </View>
          )
        )}
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <ProfileAvatar 
            avatarUrl={user?.avatarUrl} 
            isUploading={isUploadingAvatar}
            onPress={onAvatarPress}
            size={120}
          />
          <Text style={styles.userName}>
            {displayName || user?.email || "Χρήστης"}
          </Text>
        </View>

        {/* User Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <User size={18} color={colors.accent} strokeWidth={2.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Όνομα</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={onDisplayNameChange}
                  placeholder="Όνομα"
                  placeholderTextColor={colors.textMuted}
                />
              ) : (
                <Text style={styles.infoValue}>
                  {displayName || "Δεν έχει οριστεί"}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Mail size={18} color={colors.accent} strokeWidth={2.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {user?.email || "Δεν έχει οριστεί"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ProfileAchievements />

      <ProfileStats />

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  imageGradientRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    marginBottom: 16,
  },
  imageInnerRing: {
    width: "100%",
    height: "100%",
    borderRadius: 56,
    backgroundColor: colors.primaryBg,
    padding: 4,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 52,
    backgroundColor: colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 52,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
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
  input: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "600",
    backgroundColor: colors.tertiaryBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementsSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    width: "48%",
    backgroundColor: colors.secondaryBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.tertiaryBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  achievementIconLocked: {
    borderColor: colors.border,
  },
  achievementLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    marginBottom: 4,
  },
  achievementLabelLocked: {
    color: colors.textSecondary,
  },
  achievementDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: "600",
  },
  achievementDescriptionLocked: {
    color: colors.textMuted,
  },
  statsSection: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.secondaryBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    textAlign: "center",
  },
});
