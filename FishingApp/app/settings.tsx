import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors } from "../src/theme/colors";

export default function SettingsPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Ρυθμίσεις</Text>
        <Text style={styles.placeholder}>
          Οι ρυθμίσεις της εφαρμογής θα εμφανιστούν εδώ.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    paddingTop: 100,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 16,
    textAlign: "center",
  },
  placeholder: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
