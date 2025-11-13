import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";
import { glassStyle } from "../styles/glass";

interface OutOfRangeNoticeProps {
  maxDateLabel: string;
  onEdit: () => void;
}

export default function OutOfRangeNotice({
  maxDateLabel,
  onEdit,
}: OutOfRangeNoticeProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          glassStyle({ highlight: true, withShadow: true, borderRadius: 20 }),
        ]}
      >
        <Text style={styles.emoji}>🎣</Text>
        <Text style={styles.title}>Η περιπέτειά σας είναι έτοιμη!</Text>
        <Text style={styles.message}>
          Θα σας ενημερώσουμε για τις καιρικές συνθήκες όταν πλησιάσει η
          ημερομηνία που επιλέξατε.
        </Text>
        <Text style={styles.subtext}>
          Η πρόβλεψη είναι διαθέσιμη έως {maxDateLabel}
        </Text>
        <TouchableOpacity onPress={onEdit} style={styles.button}>
          <Text style={styles.buttonText}>Επεξεργασία Περιπέτειας</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 32,
  },
  card: {
    alignItems: "center",
    maxWidth: 320,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  subtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    opacity: 0.7,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
