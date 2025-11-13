// components/CatchDetailModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme/colors";

type PhotoRef = {
  key: string;
  url?: string;
  contentType?: string;
  size?: number;
};

type SpotRef = { 
  name?: string; 
  lat?: number; 
  lon?: number; 
};

type CatchItem = {
  id: string;
  species: string;
  weight?: number | null;
  length?: number | null;
  notes?: string;
  photo?: PhotoRef;
  spot?: SpotRef;
  capturedAt?: string | null;
  createdAt?: string;
};

type FishRecognitionResult = {
  species: string;
  confidence: number;
  commonName?: string;
  scientificName?: string;
  description?: string;
};

interface Props {
  catch: CatchItem | null;
  visible: boolean;
  onClose: () => void;
  onEdit?: (catchItem: CatchItem) => void;
  onDelete?: (catchId: string) => void;
  onRecognizeFish?: (photoUrl: string) => Promise<FishRecognitionResult | null>;
}

export default function CatchDetailModal({ 
  catch: catchItem, 
  visible, 
  onClose, 
  onEdit, 
  onDelete,
  onRecognizeFish 
}: Props) {
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<FishRecognitionResult | null>(null);

  if (!catchItem) return null;

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "Άγνωστη ημερομηνία";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("el-GR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Άγνωστη ημερομηνία";
    }
  };

  const handleShare = async () => {
    try {
      const message = `🎣 Ψάρεψα ${catchItem.species}!\n${
        catchItem.weight ? `Βάρος: ${catchItem.weight} kg\n` : ""
      }${catchItem.length ? `Μήκος: ${catchItem.length} cm\n` : ""}${
        catchItem.spot?.name ? `Τοποθεσία: ${catchItem.spot.name}\n` : ""
      }${catchItem.notes ? `Σημειώσεις: ${catchItem.notes}` : ""}`;
      
      await Share.share({ message });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleRecognizeFish = async () => {
    if (!onRecognizeFish || !catchItem.photo?.url) return;
    
    setRecognizing(true);
    try {
      const result = await onRecognizeFish(catchItem.photo.url);
      setRecognitionResult(result);
    } catch (error) {
      Alert.alert("Σφάλμα", "Δεν ήταν δυνατή η αναγνώριση του ψαριού");
    } finally {
      setRecognizing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Διαγραφή αλιεύματος",
      "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το άλιευμα;",
      [
        { text: "Ακύρωση", style: "cancel" },
        {
          text: "Διαγραφή",
          style: "destructive",
          onPress: () => {
            onDelete?.(catchItem.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Header Image */}
          <View style={styles.modalMedia}>
            {catchItem.photo?.url ? (
              <Image
                source={{ uri: catchItem.photo.url }}
                style={styles.modalImg}
                contentFit="cover"
                transition={200}
                onError={(e: any) =>
                  console.log("modal image error:", e.nativeEvent)
                }
              />
            ) : (
              <View style={styles.placeholderImg}>
                <Ionicons name="fish-outline" size={48} color="#9BA3AF" />
                <Text style={styles.placeholderText}>Χωρίς εικόνα</Text>
              </View>
            )}
            
            <View style={styles.modalOverlay} />
            
            {/* Close button */}
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={18} color={colors.white} />
              </TouchableOpacity>
              
              {catchItem.photo?.url && onRecognizeFish && (
                <TouchableOpacity 
                  style={[styles.actionBtn, recognizing && styles.actionBtnDisabled]} 
                  onPress={handleRecognizeFish}
                  disabled={recognizing}
                >
                  {recognizing ? (
                    <Ionicons name="refresh" size={18} color="#9BA3AF" />
                  ) : (
                    <Ionicons name="search-outline" size={18} color={colors.white} />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Species badge */}
            <View style={styles.speciesBadge}>
              <Text style={styles.speciesText}>{catchItem.species}</Text>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={{ padding: 16, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Info */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Λεπτομέρειες Αλιεύματος</Text>
              <View style={styles.statsRow}>
                {catchItem.weight && (
                  <View style={styles.statItem}>
                    <Ionicons name="barbell-outline" size={16} color={colors.accent} />
                    <Text style={styles.statValue}>{catchItem.weight} kg</Text>
                    <Text style={styles.statLabel}>Βάρος</Text>
                  </View>
                )}
                
                {catchItem.length && (
                  <View style={styles.statItem}>
                    <Ionicons name="resize-outline" size={16} color={colors.accent} />
                    <Text style={styles.statValue}>{catchItem.length} cm</Text>
                    <Text style={styles.statLabel}>Μήκος</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Date & Location */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Χρόνος & Τόπος</Text>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.accent} />
                <Text style={styles.infoText}>
                  {fmtDate(catchItem.capturedAt || catchItem.createdAt)}
                </Text>
              </View>
              
              {catchItem.spot?.name && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color={colors.accent} />
                  <Text style={styles.infoText}>{catchItem.spot.name}</Text>
                </View>
              )}
            </View>

            {/* Notes */}
            {catchItem.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Σημειώσεις</Text>
                <Text style={styles.notesText}>{catchItem.notes}</Text>
              </View>
            )}

            {/* AI Recognition Result */}
            {recognitionResult && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Αναγνώριση AI</Text>
                <View style={styles.recognitionCard}>
                  <View style={styles.recognitionHeader}>
                    <Ionicons name="sparkles" size={16} color={colors.accent} />
                    <Text style={styles.recognitionSpecies}>
                      {recognitionResult.commonName || recognitionResult.species}
                    </Text>
                    <View style={styles.confidenceBadge}>
                      <Text style={styles.confidenceText}>
                        {Math.round(recognitionResult.confidence * 100)}%
                      </Text>
                    </View>
                  </View>
                  
                  {recognitionResult.scientificName && (
                    <Text style={styles.scientificName}>
                      {recognitionResult.scientificName}
                    </Text>
                  )}
                  
                  {recognitionResult.description && (
                    <Text style={styles.recognitionDesc}>
                      {recognitionResult.description}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              {onEdit && (
                <TouchableOpacity 
                  style={styles.secondaryBtn}
                  onPress={() => {
                    onEdit(catchItem);
                    onClose();
                  }}
                >
                  <Ionicons name="pencil-outline" size={16} color={colors.white} />
                  <Text style={styles.secondaryBtnText}>Επεξεργασία</Text>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity 
                  style={styles.dangerBtn}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                  <Text style={styles.dangerBtnText}>Διαγραφή</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "88%",
    backgroundColor: colors.primaryBg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  modalMedia: {
    width: "100%",
    height: 220,
    position: "relative",
  },
  modalImg: { 
    ...StyleSheet.absoluteFillObject 
  },
  placeholderImg: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    gap: 8,
  },
  placeholderText: {
    color: "#9BA3AF", 
    fontSize: 14, 
    fontWeight: "600"
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
  },
  actionButtons: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
  },
  actionBtnDisabled: {
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  speciesBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  speciesText: {
    color: colors.primaryBg,
    fontSize: 16,
    fontWeight: "800",
  },
  section: { 
    gap: 12 
  },
  sectionLabel: { 
    color: "#CBD5E1", 
    fontSize: 12, 
    letterSpacing: 0.3,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: "#9BA3AF",
    fontSize: 11,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  notesText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  recognitionCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 8,
  },
  recognitionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recognitionSpecies: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: colors.primaryBg,
    fontSize: 12,
    fontWeight: "700",
  },
  scientificName: {
    color: "#9BA3AF",
    fontSize: 13,
    fontStyle: "italic",
    marginLeft: 24,
  },
  recognitionDesc: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
  },
  secondaryBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  dangerBtn: {
    flex: 1,
    backgroundColor: "rgba(255,107,107,0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,107,107,0.3)",
  },
  dangerBtnText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "700",
  },
});