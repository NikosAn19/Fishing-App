import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors } from "../../theme/colors";

export default function ErrorState() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require("../../../assets/images/logo_transparent.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.errorText}>
          Κάτι πήγε στραβά. Δοκίμασε ξανά αργότερα.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    padding: 32,
    borderRadius: 16,
    backgroundColor: colors.secondaryBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 120,
    height: 120,
  },
  errorText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
  },
});


