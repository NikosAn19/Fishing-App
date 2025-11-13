// app/(drawer)/catches/index.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { colors } from "../src/theme/colors";
import { useCatches } from "../src/features/catches/hooks/useCatches";
import {
  CatchItem,
  PhotoRef,
  FishRecognitionResult,
} from "../src/features/catches/types";

// API_BASE is now imported from centralized config

/** CDN base */
const RAW_CDN =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_CDN_BASE ??
  "https://pub-6152823702fd4064a507eac85c165f45.r2.dev";
const CDN_BASE = RAW_CDN.replace(/\/+$/, "");

const PAGE_SIZE = 20;

// CatchDetailModal Component
function CatchDetailModal({
  catch: catchItem,
  visible,
  onClose,
  onEdit,
  onDelete,
  onRecognizeFish,
}: {
  catch: CatchItem | null;
  visible: boolean;
  onClose: () => void;
  onEdit?: (catchItem: CatchItem) => void;
  onDelete?: (catchId: string) => void;
  onRecognizeFish?: (photoUrl: string) => Promise<FishRecognitionResult | null>;
}) {
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] =
    useState<FishRecognitionResult | null>(null);

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
      <View style={modalStyles.modalBackdrop}>
        <View style={modalStyles.modalCard}>
          {/* Header Image */}
          <View style={modalStyles.modalMedia}>
            {catchItem.photo?.url ? (
              <Image
                source={{ uri: catchItem.photo.url }}
                style={modalStyles.modalImg}
                contentFit="cover"
                transition={200}
                onError={(e: any) =>
                  console.log("modal image error:", e.nativeEvent)
                }
              />
            ) : (
              <View style={modalStyles.placeholderImg}>
                <Ionicons name="fish-outline" size={48} color="#9BA3AF" />
                <Text style={modalStyles.placeholderText}>Χωρίς εικόνα</Text>
              </View>
            )}

            <View style={modalStyles.modalOverlay} />

            {/* Close button */}
            <TouchableOpacity onPress={onClose} style={modalStyles.modalClose}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>

            {/* Action buttons */}
            <View style={modalStyles.actionButtons}>
              <TouchableOpacity
                style={modalStyles.actionBtn}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={18} color={colors.white} />
              </TouchableOpacity>

              {catchItem.photo?.url && onRecognizeFish && (
                <TouchableOpacity
                  style={[
                    modalStyles.actionBtn,
                    recognizing && modalStyles.actionBtnDisabled,
                  ]}
                  onPress={handleRecognizeFish}
                  disabled={recognizing}
                >
                  {recognizing ? (
                    <Ionicons name="refresh" size={18} color="#9BA3AF" />
                  ) : (
                    <Ionicons
                      name="search-outline"
                      size={18}
                      color={colors.white}
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Species badge */}
            <View style={modalStyles.speciesBadge}>
              <Text style={modalStyles.speciesText}>{catchItem.species}</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 16, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Info */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionLabel}>
                Λεπτομέρειες Αλιεύματος
              </Text>
              <View style={modalStyles.statsRow}>
                {catchItem.weight && (
                  <View style={modalStyles.statItem}>
                    <Ionicons
                      name="barbell-outline"
                      size={16}
                      color={colors.accent}
                    />
                    <Text style={modalStyles.statValue}>
                      {catchItem.weight} kg
                    </Text>
                    <Text style={modalStyles.statLabel}>Βάρος</Text>
                  </View>
                )}

                {catchItem.length && (
                  <View style={modalStyles.statItem}>
                    <Ionicons
                      name="resize-outline"
                      size={16}
                      color={colors.accent}
                    />
                    <Text style={modalStyles.statValue}>
                      {catchItem.length} cm
                    </Text>
                    <Text style={modalStyles.statLabel}>Μήκος</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Date & Location */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionLabel}>Χρόνος & Τόπος</Text>
              <View style={modalStyles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.accent}
                />
                <Text style={modalStyles.infoText}>
                  {fmtDate(catchItem.capturedAt || catchItem.createdAt)}
                </Text>
              </View>

              {catchItem.spot?.name && (
                <View style={modalStyles.infoRow}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={colors.accent}
                  />
                  <Text style={modalStyles.infoText}>
                    {catchItem.spot.name}
                  </Text>
                </View>
              )}
            </View>

            {/* Notes */}
            {catchItem.notes && (
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionLabel}>Σημειώσεις</Text>
                <Text style={modalStyles.notesText}>{catchItem.notes}</Text>
              </View>
            )}

            {/* AI Recognition Result */}
            {recognitionResult && (
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionLabel}>Αναγνώριση AI</Text>
                <View style={modalStyles.recognitionCard}>
                  <View style={modalStyles.recognitionHeader}>
                    <Ionicons name="sparkles" size={16} color={colors.accent} />
                    <Text style={modalStyles.recognitionSpecies}>
                      {recognitionResult.commonName ||
                        recognitionResult.species}
                    </Text>
                    <View style={modalStyles.confidenceBadge}>
                      <Text style={modalStyles.confidenceText}>
                        {Math.round(recognitionResult.confidence * 100)}%
                      </Text>
                    </View>
                  </View>

                  {recognitionResult.scientificName && (
                    <Text style={modalStyles.scientificName}>
                      {recognitionResult.scientificName}
                    </Text>
                  )}

                  {recognitionResult.description && (
                    <Text style={modalStyles.recognitionDesc}>
                      {recognitionResult.description}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={modalStyles.buttonRow}>
              {onEdit && (
                <TouchableOpacity
                  style={modalStyles.secondaryBtn}
                  onPress={() => {
                    onEdit(catchItem);
                    onClose();
                  }}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={16}
                    color={colors.white}
                  />
                  <Text style={modalStyles.secondaryBtnText}>Επεξεργασία</Text>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  style={modalStyles.dangerBtn}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                  <Text style={modalStyles.dangerBtnText}>Διαγραφή</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function CatchesScreen() {
  const insets = useSafeAreaInsets();

  const {
    items,
    total,
    loading,
    fetchingMore,
    refreshing,
    error,
    canLoadMore,
    loadMore,
    refresh,
    recognizeFish,
    deleteCatch,
  } = useCatches({ pageSize: PAGE_SIZE });
  const [selectedCatch, setSelectedCatch] = useState<CatchItem | null>(null);

  const buildImageUrl = (p?: PhotoRef) => {
    // 1) Αν δεν υπάρχει photo ref → no image
    if (!p) return null;

    // 2) Έλεγχος και διόρθωση URL από τον server
    if (p.url && /https?:\/\//.test(p.url)) {
      let fixedUrl = p.url;

      // Fix 1: Διόρθωση διπλού bucket name
      fixedUrl = fixedUrl.replace("/psarakibucket/psarakibucket/", "/");

      // Fix 2: Διόρθωση typos στο bucket name
      fixedUrl = fixedUrl
        .replace("/psarakibbucket/", "/")
        .replace("/psarakibuckket/", "/");

      // Fix 3: Αν χρησιμοποιεί R2 storage domains, αντικατάστησε με CDN
      if (fixedUrl.includes(".r2.cloudflarestorage.com/")) {
        // Εξαγωγή του key path (το μέρος μετά το bucket)
        const keyMatch = fixedUrl.match(
          /\/(?:psarakibucket\/?)?(original\/.*)/
        );
        if (keyMatch && CDN_BASE) {
          fixedUrl = `${CDN_BASE}/${keyMatch[1]}`;
        }
      }

      // Fix 4: Έλεγχος για άλλα προβληματικά domains
      if (fixedUrl.includes("cdn.psaraki.app")) {
        // Αν το custom domain δεν λειτουργεί, χρήσε το CDN
        const keyMatch = fixedUrl.match(/(original\/.*)/);
        if (keyMatch && CDN_BASE) {
          fixedUrl = `${CDN_BASE}/${keyMatch[1]}`;
        }
      }

      return fixedUrl;
    }

    // 3) Fallback: Αν έχουμε key, χτίζουμε με CDN_BASE
    if (p.key && CDN_BASE) {
      const base = CDN_BASE.replace(/\/+$/, "");
      const keyPath = p.key.replace(/^\/+/, "");
      const url = `${base}/${keyPath}`;
      return url;
    }

    return null;
  };

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("el-GR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const onEndReached = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const handleEditCatch = (catchItem: CatchItem) => {
    // TODO: Navigate to edit screen or open edit modal
    console.log("Edit catch:", catchItem.id);
    Alert.alert("Επεξεργασία", "Coming soon - Edit functionality");
  };

  const handleDeleteCatch = async (catchId: string) => {
    try {
      await deleteCatch(catchId);
      Alert.alert("Επιτυχία", "Το άλιευμα διαγράφηκε");
      if (selectedCatch?.id === catchId) {
        setSelectedCatch(null);
      }
    } catch (error) {
      console.log("Delete error:", error);
      Alert.alert("Σφάλμα", "Δεν ήταν δυνατή η διαγραφή");
    }
  };

  const renderCard = ({ item }: { item: CatchItem }) => {
    const img = buildImageUrl(item.photo);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => setSelectedCatch(item)}
      >
        <ImageBackground
          source={img ? { uri: img } : undefined}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}
          defaultSource={undefined}
        >
          {!img && (
            <View style={styles.placeholderWrap}>
              <Ionicons name="fish-outline" size={28} color="#9BA3AF" />
              <Text style={styles.placeholderText}>Χωρίς εικόνα</Text>
            </View>
          )}

          <View style={styles.overlay} />

          <View style={styles.topRow}>
            <View style={styles.chip}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={colors.primaryBg}
              />
              <Text style={styles.chipText}>
                {fmtDate(item.capturedAt || item.createdAt)}
              </Text>
            </View>
            {!!item.spot?.name && (
              <View style={styles.chip}>
                <Ionicons
                  name="pin-outline"
                  size={12}
                  color={colors.primaryBg}
                />
                <Text style={styles.chipText}>{item.spot.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.species}>{item.species}</Text>
            <View style={styles.metaRow}>
              {item.weight != null && (
                <View style={styles.metaChip}>
                  <Ionicons
                    name="barbell-outline"
                    size={14}
                    color={colors.white}
                  />
                  <Text style={styles.metaText}>{item.weight} kg</Text>
                </View>
              )}
              {item.length != null && (
                <View style={styles.metaChip}>
                  <Ionicons
                    name="resize-outline"
                    size={14}
                    color={colors.white}
                  />
                  <Text style={styles.metaText}>{item.length} cm</Text>
                </View>
              )}
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  if (loading && items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Τα Αλιεύματά μου</Text>
        </View>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.accent} />
          <Text style={{ color: "#9BA3AF", marginTop: 8 }}>Φόρτωση…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Τα Αλιεύματά μου</Text>
        {!!total && (
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{total}</Text>
          </View>
        )}
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={colors.primaryBg}
          />
          <Text style={styles.errorText}>Αποτυχία φόρτωσης: {error}</Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={renderCard}
        onEndReachedThreshold={0.3}
        onEndReached={onEndReached}
        ListFooterComponent={
          fetchingMore ? (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", padding: 32 }}>
            <Ionicons name="fish-outline" size={28} color="#9BA3AF" />
            <Text style={{ color: "#9BA3AF", marginTop: 8 }}>
              Δεν υπάρχουν ακόμα αλιεύματα
            </Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <CatchDetailModal
        catch={selectedCatch}
        visible={!!selectedCatch}
        onClose={() => setSelectedCatch(null)}
        onEdit={handleEditCatch}
        onDelete={handleDeleteCatch}
        onRecognizeFish={recognizeFish}
      />
    </View>
  );
}

const CARD_BG = "rgba(255,255,255,0.06)";
const BORDER = "rgba(255,255,255,0.10)";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryBg },
  headerRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: colors.white, fontSize: 20, fontWeight: "800" },
  countPill: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  countPillText: { color: colors.white, fontWeight: "700", fontSize: 12 },

  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,159,122,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,159,122,0.45)",
  },
  errorText: { color: colors.white, fontSize: 13, flex: 1 },

  card: {
    flex: 1,
    minHeight: 200,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  cardImage: { flex: 1, justifyContent: "space-between" },
  cardImageStyle: { borderRadius: 14 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  topRow: {
    padding: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { color: colors.primaryBg, fontSize: 11, fontWeight: "800" },

  bottomRow: { padding: 12 },
  species: { color: colors.white, fontSize: 16, fontWeight: "900" },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  metaText: { color: colors.white, fontSize: 12, fontWeight: "700" },

  placeholderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  placeholderText: { color: "#9BA3AF", fontSize: 12, fontWeight: "600" },
});

// Modal Styles
const modalStyles = StyleSheet.create({
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
    ...StyleSheet.absoluteFillObject,
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
    fontWeight: "600",
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
    gap: 12,
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
