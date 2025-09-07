import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../src/theme/colors";
import { useCameraStore } from "../src/stores/cameraStore";

export default function ReviewScreen() {
  const params = useLocalSearchParams();
  const raw = params.uri as string | string[] | undefined;

  // ΔΕΝ κάνουμε decode εδώ (ήδη decoded από expo-router)!
  const photoUri = Array.isArray(raw) ? raw[0] : raw;

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startFishIdentification } = useCameraStore();

  const [fishType, setFishType] = useState("");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [notes, setNotes] = useState("");
  const [isIdentifying, setIsIdentifying] = useState(false);

  const handleFishIdentification = async () => {
    if (!photoUri) return;
    setIsIdentifying(true);
    try {
      await startFishIdentification(photoUri);
      Alert.alert(
        "Fish Identification",
        "Fish identification completed! Check the results.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to identify fish");
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSaveCatch = () => {
    if (!fishType.trim()) {
      Alert.alert("Error", "Please enter the fish type");
      return;
    }
    console.log("💾 Saving catch:", {
      fishType,
      weight,
      length,
      notes,
      photoUri,
    });
    Alert.alert("Success", "Catch saved successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  if (!photoUri) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>No photo to review</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Catch</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Photo */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: photoUri }}
            style={styles.photo}
            resizeMode="cover"
            onError={(e) => console.log("Image load error:", e.nativeEvent)}
          />

          <TouchableOpacity
            style={styles.identifyButton}
            onPress={handleFishIdentification}
            disabled={isIdentifying}
          >
            <Ionicons name="search" size={20} color={colors.white} />
            <Text style={styles.identifyButtonText}>
              {isIdentifying ? "Identifying..." : "Identify Fish"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Catch Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fish Type *</Text>
            <TextInput
              style={styles.input}
              value={fishType}
              onChangeText={setFishType}
              placeholder="e.g., Sea Bass, Red Mullet"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="0.5"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Length (cm)</Text>
              <TextInput
                style={styles.input}
                value={length}
                onChangeText={setLength}
                placeholder="25"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes about the catch..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveCatch}>
          <Text style={styles.saveButtonText}>Save Catch</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryBg },
  scrollView: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: colors.white },
  placeholder: { width: 40 },
  photoContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  photo: { width: "100%", height: 300 },
  identifyButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  identifyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  formContainer: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: "row", gap: 16 },
  halfWidth: { flex: 1 },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.white,
  },
  textArea: { height: 80, paddingTop: 12 },
  saveButton: {
    backgroundColor: colors.accent,
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: { color: colors.white, fontSize: 18, fontWeight: "600" },
  errorText: {
    color: colors.white,
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
});
