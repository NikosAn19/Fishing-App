import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../../../theme/colors";
import { ArrowLeft } from "lucide-react-native";
import { glassStyle } from "../styles/glass";

interface ProgressBulletsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export default function ProgressBullets({
  currentStep,
  totalSteps,
  onBack,
}: ProgressBulletsProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={[styles.progressContainer, glassStyle({ borderRadius: 16 })]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={24} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.progressContent}>
        <View style={styles.progressBar}>
          {steps.map((step) => (
            <View
              key={step}
              style={[
                styles.progressStep,
                step <= currentStep && styles.progressStepActive,
                step < currentStep && styles.progressStepCompleted,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          {currentStep}/{totalSteps}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 8,
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    zIndex: 1,
  },
  progressContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  progressStep: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 3,
  },
  progressStepActive: {
    backgroundColor: colors.accent,
  },
  progressStepCompleted: {
    backgroundColor: colors.accent,
  },
  progressText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
});
