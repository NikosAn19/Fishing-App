import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../src/theme/colors";
import {
  User,
  Mail,
  Edit3,
  Check,
  X,
  Trophy,
  Fish,
  Target,
  Award,
} from "lucide-react-native";

interface ProfileScreenProps {
  initialData?: {
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  onSave?: (data: {
    firstName: string;
    lastName: string;
    email: string;
  }) => void;
}

export default function ProfileScreen({
  initialData = {
    firstName: "Νίκας",
    lastName: "Παπαδόπουλος",
    email: "nikas@psaraki.gr",
  },
  onSave,
}: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [email, setEmail] = useState(initialData.email);

  const handleSave = () => {
    onSave?.({ firstName, lastName, email });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFirstName(initialData.firstName);
    setLastName(initialData.lastName);
    setEmail(initialData.email);
    setIsEditing(false);
  };

  const achievements = [
    { icon: Fish, label: "Πρώτο Ψάρι", description: "Κατέγραψες το πρώτο σου ψάρι", unlocked: true },
    { icon: Target, label: "Μαστρο-Ψαράς", description: "10 επιτυχημένα ψαρέματα", unlocked: true },
    { icon: Trophy, label: "Πρωταθλητής", description: "50 επιτυχημένα ψαρέματα", unlocked: false },
    { icon: Award, label: "Θρύλος", description: "100 επιτυχημένα ψαρέματα", unlocked: false },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Προφίλ</Text>
        {!isEditing ? (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
          >
            <Edit3 size={20} color={colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <X size={20} color={colors.textSecondary} strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Check size={20} color={colors.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <LinearGradient
            colors={[colors.accentGradientStart, colors.accentGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.imageGradientRing}
          >
            <View style={styles.imageInnerRing}>
              <View style={styles.imagePlaceholder}>
                <User size={56} color={colors.textSecondary} strokeWidth={1.5} />
              </View>
            </View>
          </LinearGradient>
          <Text style={styles.userName}>{firstName} {lastName}</Text>
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
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Όνομα"
                  placeholderTextColor={colors.textMuted}
                />
              ) : (
                <Text style={styles.infoValue}>{firstName}</Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <User size={18} color={colors.accent} strokeWidth={2.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Επώνυμο</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Επώνυμο"
                  placeholderTextColor={colors.textMuted}
                />
              ) : (
                <Text style={styles.infoValue}>{lastName}</Text>
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
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.infoValue}>{email}</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Achievements Section */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Επιτεύγματα</Text>
        
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <View
                key={index}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                <View
                  style={[
                    styles.achievementIconContainer,
                    !achievement.unlocked && styles.achievementIconLocked,
                  ]}
                >
                  <Icon
                    size={24}
                    color={achievement.unlocked ? colors.accent : colors.textMuted}
                    strokeWidth={2.5}
                  />
                </View>
                <Text
                  style={[
                    styles.achievementLabel,
                    !achievement.unlocked && styles.achievementLabelLocked,
                  ]}
                >
                  {achievement.label}
                </Text>
                <Text
                  style={[
                    styles.achievementDescription,
                    !achievement.unlocked && styles.achievementDescriptionLocked,
                  ]}
                >
                  {achievement.description}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Συνολικά Ψαρέματα</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>18</Text>
          <Text style={styles.statLabel}>Είδη Ψαριών</Text>
        </View>
      </View>

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