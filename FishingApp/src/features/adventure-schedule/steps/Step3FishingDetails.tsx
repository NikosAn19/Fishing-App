import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { colors } from "../../../theme/colors";
import { Fish, Anchor, FileText, Plus, X } from "lucide-react-native";

interface Step3FishingDetailsProps {
  initialDetails?: {
    technique?: string;
    lures?: string[];
    notes?: string;
  };
  onDetailsUpdated: (details: {
    technique?: string;
    lures?: string[];
    notes?: string;
  }) => void;
}

const FISHING_TECHNIQUES = [
  {
    id: "spinning",
    name: "Spinning",
    description: "Using spinning reels and lures",
  },
  {
    id: "bottom_fishing",
    name: "Bottom Fishing",
    description: "Fishing near the seafloor",
  },
  {
    id: "surface_fishing",
    name: "Surface Fishing",
    description: "Fishing at the water surface",
  },
  {
    id: "trolling",
    name: "Trolling",
    description: "Dragging lures behind a moving boat",
  },
  {
    id: "fly_fishing",
    name: "Fly Fishing",
    description: "Using artificial flies as bait",
  },
  {
    id: "spearfishing",
    name: "Spearfishing",
    description: "Hunting fish with a spear",
  },
];

const POPULAR_LURES = [
  "Jig Head",
  "Soft Plastic",
  "Metal Spoon",
  "Spinner",
  "Crankbait",
  "Topwater",
  "Swimbait",
  "Worm",
  "Minnow",
  "Popper",
];

export default function Step3FishingDetails({
  initialDetails,
  onDetailsUpdated,
}: Step3FishingDetailsProps) {
  const [selectedTechnique, setSelectedTechnique] = useState(
    initialDetails?.technique || ""
  );
  const [selectedLures, setSelectedLures] = useState<string[]>(
    initialDetails?.lures || []
  );
  const [notes, setNotes] = useState(initialDetails?.notes || "");
  const [customLure, setCustomLure] = useState("");

  const handleTechniqueSelect = (techniqueId: string) => {
    setSelectedTechnique(techniqueId);
    updateDetails({ technique: techniqueId, lures: selectedLures, notes });
  };

  const handleLureToggle = (lure: string) => {
    const newLures = selectedLures.includes(lure)
      ? selectedLures.filter((l) => l !== lure)
      : [...selectedLures, lure];

    setSelectedLures(newLures);
    updateDetails({ technique: selectedTechnique, lures: newLures, notes });
  };

  const handleAddCustomLure = () => {
    if (customLure.trim() && !selectedLures.includes(customLure.trim())) {
      const newLures = [...selectedLures, customLure.trim()];
      setSelectedLures(newLures);
      setCustomLure("");
      updateDetails({ technique: selectedTechnique, lures: newLures, notes });
    }
  };

  const handleRemoveLure = (lureToRemove: string) => {
    const newLures = selectedLures.filter((l) => l !== lureToRemove);
    setSelectedLures(newLures);
    updateDetails({ technique: selectedTechnique, lures: newLures, notes });
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    updateDetails({
      technique: selectedTechnique,
      lures: selectedLures,
      notes: newNotes,
    });
  };

  const updateDetails = (details: {
    technique?: string;
    lures?: string[];
    notes?: string;
  }) => {
    onDetailsUpdated(details);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Fish size={24} color={colors.accent} />
        <View style={styles.instructionsTextContainer}>
          <Text style={styles.instructionsTitle}>
            Fishing Details (Optional)
          </Text>
          <Text style={styles.instructionsText}>
            Add information about your fishing technique and gear. This helps
            with better forecasting.
          </Text>
        </View>
      </View>

      {/* Fishing Technique Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Anchor size={20} color={colors.accent} />
          <Text style={styles.sectionTitle}>Fishing Technique</Text>
        </View>

        <View style={styles.techniquesGrid}>
          {FISHING_TECHNIQUES.map((technique) => (
            <TouchableOpacity
              key={technique.id}
              onPress={() => handleTechniqueSelect(technique.id)}
              style={[
                styles.techniqueCard,
                selectedTechnique === technique.id &&
                  styles.techniqueCardSelected,
              ]}
            >
              <Text
                style={[
                  styles.techniqueName,
                  selectedTechnique === technique.id &&
                    styles.techniqueNameSelected,
                ]}
              >
                {technique.name}
              </Text>
              <Text
                style={[
                  styles.techniqueDescription,
                  selectedTechnique === technique.id &&
                    styles.techniqueDescriptionSelected,
                ]}
              >
                {technique.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lures Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Anchor size={20} color={colors.accent} />
          <Text style={styles.sectionTitle}>Lures & Bait</Text>
        </View>

        {/* Selected Lures */}
        {selectedLures.length > 0 && (
          <View style={styles.selectedLuresContainer}>
            <Text style={styles.selectedLuresLabel}>Selected:</Text>
            <View style={styles.selectedLuresList}>
              {selectedLures.map((lure) => (
                <View key={lure} style={styles.selectedLureChip}>
                  <Text style={styles.selectedLureText}>{lure}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveLure(lure)}
                    style={styles.removeLureButton}
                  >
                    <X size={14} color={colors.primaryBg} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Popular Lures */}
        <Text style={styles.luresLabel}>Popular Lures:</Text>
        <View style={styles.luresGrid}>
          {POPULAR_LURES.map((lure) => (
            <TouchableOpacity
              key={lure}
              onPress={() => handleLureToggle(lure)}
              style={[
                styles.lureButton,
                selectedLures.includes(lure) && styles.lureButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.lureButtonText,
                  selectedLures.includes(lure) && styles.lureButtonTextSelected,
                ]}
              >
                {lure}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Lure Input */}
        <View style={styles.customLureContainer}>
          <TextInput
            style={styles.customLureInput}
            placeholder="Add custom lure..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={customLure}
            onChangeText={setCustomLure}
            onSubmitEditing={handleAddCustomLure}
          />
          <TouchableOpacity
            onPress={handleAddCustomLure}
            style={styles.addLureButton}
            disabled={!customLure.trim()}
          >
            <Plus
              size={20}
              color={
                customLure.trim() ? colors.accent : "rgba(255,255,255,0.3)"
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={20} color={colors.accent} />
          <Text style={styles.sectionTitle}>Notes</Text>
        </View>

        <TextInput
          style={styles.notesInput}
          placeholder="Add any additional notes about your fishing adventure..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={notes}
          onChangeText={handleNotesChange}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Summary */}
      {(selectedTechnique || selectedLures.length > 0 || notes) && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Adventure Summary:</Text>

          {selectedTechnique && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Technique:</Text>
              <Text style={styles.summaryValue}>
                {
                  FISHING_TECHNIQUES.find((t) => t.id === selectedTechnique)
                    ?.name
                }
              </Text>
            </View>
          )}

          {selectedLures.length > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Lures:</Text>
              <Text style={styles.summaryValue}>
                {selectedLures.join(", ")}
              </Text>
            </View>
          )}

          {notes && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Notes:</Text>
              <Text style={styles.summaryValue}>{notes}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  instructionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(18, 219, 192, 0.1)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },
  instructionsTextContainer: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  techniquesGrid: {
    gap: 12,
  },
  techniqueCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  techniqueCardSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  techniqueName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 4,
  },
  techniqueNameSelected: {
    color: colors.primaryBg,
  },
  techniqueDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  techniqueDescriptionSelected: {
    color: "rgba(33, 43, 54, 0.8)",
  },
  selectedLuresContainer: {
    marginBottom: 16,
  },
  selectedLuresLabel: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "600",
    marginBottom: 8,
  },
  selectedLuresList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedLureChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  selectedLureText: {
    fontSize: 12,
    color: colors.primaryBg,
    fontWeight: "600",
  },
  removeLureButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(33, 43, 54, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  luresLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  luresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  lureButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  lureButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  lureButtonText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "500",
  },
  lureButtonTextSelected: {
    color: colors.primaryBg,
  },
  customLureContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customLureInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    color: colors.white,
    fontSize: 14,
  },
  addLureButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  notesInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 12,
    color: colors.white,
    fontSize: 14,
    minHeight: 100,
  },
  summaryContainer: {
    margin: 16,
    backgroundColor: "rgba(18, 219, 192, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(18, 219, 192, 0.2)",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent,
    marginBottom: 12,
  },
  summaryItem: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "500",
  },
});
