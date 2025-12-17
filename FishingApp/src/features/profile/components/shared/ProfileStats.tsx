import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../../../../theme/colors';

interface ProfileStatsProps {
  catchesCount?: number;
  speciesCount?: number;
}

export function ProfileStats({ catchesCount = 24, speciesCount = 18 }: ProfileStatsProps) {
  return (
    <View style={styles.statsSection}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{catchesCount}</Text>
        <Text style={styles.statLabel}>Συνολικά Ψαρέματα</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{speciesCount}</Text>
        <Text style={styles.statLabel}>Είδη Ψαριών</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
