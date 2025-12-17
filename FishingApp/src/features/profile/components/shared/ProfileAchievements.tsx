import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Trophy, Fish, Target, Award } from 'lucide-react-native';
import { colors } from '../../../../theme/colors';

const achievements = [
  {
    icon: Fish,
    label: "Πρώτο Ψάρι",
    description: "Κατέγραψες το πρώτο σου ψάρι",
    unlocked: true,
  },
  {
    icon: Target,
    label: "Μαστρο-Ψαράς",
    description: "10 επιτυχημένα ψαρέματα",
    unlocked: true,
  },
  {
    icon: Trophy,
    label: "Πρωταθλητής",
    description: "50 επιτυχημένα ψαρέματα",
    unlocked: false,
  },
  {
    icon: Award,
    label: "Θρύλος",
    description: "100 επιτυχημένα ψαρέματα",
    unlocked: false,
  },
];

export function ProfileAchievements() {
  return (
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
                  color={
                    achievement.unlocked ? colors.accent : colors.textMuted
                  }
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
                  !achievement.unlocked &&
                    styles.achievementDescriptionLocked,
                ]}
              >
                {achievement.description}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
