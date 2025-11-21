import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import AdventureScheduleWizard from "./AdventureScheduleWizard";
import { AdventureScheduleData } from "./types";
import { Fish, X } from "lucide-react-native";
import { glassStyle } from "./styles/glass";

interface AdventureScheduleModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AdventureScheduleModal({
  visible,
  onClose,
}: AdventureScheduleModalProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [completedAdventure, setCompletedAdventure] =
    useState<AdventureScheduleData | null>(null);

  const handleStartAdventure = () => {
    setShowWizard(true);
    setCompletedAdventure(null);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
  };

  const handleAdventureComplete = (adventureData: AdventureScheduleData) => {
    setCompletedAdventure(adventureData);
    setShowWizard(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {!showWizard ? (
          <View style={styles.demoContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={[styles.content, glassStyle()]}>
              <View style={styles.iconContainer}>
                <Fish size={64} color={colors.accent} />
              </View>

              <Text style={styles.title}>Adventure Scheduler</Text>
              <Text style={styles.subtitle}>
                Plan your perfect fishing adventure with weather forecasts and
                detailed planning.
              </Text>

              {completedAdventure && (
                <View
                  style={[
                    styles.completedContainer,
                    glassStyle({ highlight: true }),
                  ]}
                >
                  <Text style={styles.completedTitle}>
                    Adventure Planned! 🎣
                  </Text>
                  <Text style={styles.completedText}>
                    Location:{" "}
                    {completedAdventure.coordinates?.latitude.toFixed(4)},{" "}
                    {completedAdventure.coordinates?.longitude.toFixed(4)}
                  </Text>
                  <Text style={styles.completedText}>
                    Date: {completedAdventure.selectedDate}
                  </Text>
                  {completedAdventure.fishingDetails?.technique && (
                    <Text style={styles.completedText}>
                      Technique: {completedAdventure.fishingDetails.technique}
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={handleStartAdventure}
                style={[styles.startButton, glassStyle({ highlight: true })]}
              >
                <Fish size={24} color={colors.white} />
                <Text style={styles.startButtonText}>
                  {completedAdventure
                    ? "Plan Another Adventure"
                    : "Start Planning"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <AdventureScheduleWizard
            onClose={handleWizardClose}
            onAdventureSaved={() => {
              setCompletedAdventure(null);
              // Optionally refresh adventures list here if needed
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  demoContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 24,
    margin: 16,
    borderRadius: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(18, 219, 192, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
  },
  completedContainer: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
    width: "100%",
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.accent,
    textAlign: "center",
    marginBottom: 12,
  },
  completedText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    minHeight: 56,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
});
