import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme/colors";
import { Image } from "expo-image";

type Species = {
  id: string;
  name: string;
  latinName: string;
  image: string; // direct HTTPS URL
  habitats: ("Ακτή" | "Σκάφος" | "Βράχια" | "Αμμώδες")[];
  methods: ("Spinning" | "Eging" | "Surf" | "Jigging" | "Float" | "Bottom")[];
  baits: string[];
  season: string;
  minLegalSizeCm?: number | null;
  skill: "Εύκολο" | "Μέτριο" | "Προχωρημένο";
};

export const SAMPLE_SPECIES: Species[] = [
  {
    id: "labrax",
    name: "Λαβράκι",
    latinName: "Dicentrarchus labrax",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/Dicentrarchus_labrax_LoroParqueTenerife_seabass_IMG_4959.JPG",
    habitats: ["Ακτή", "Βράχια", "Αμμώδες"],
    methods: ["Spinning", "Surf", "Float"],
    baits: ["Minnow", "Topwater", "Σαρδέλα"],
    season: "Όλο το χρόνο – καλύτερα φθινόπωρο/χειμώνα, αυγή/σούρουπο",
    minLegalSizeCm: 25,
    skill: "Μέτριο",
  },
  {
    id: "aurata",
    name: "Τσιπούρα",
    latinName: "Sparus aurata",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/01/Dorada_%28Sparus_aurata%29%2C_Cabo_de_Palos%2C_Espa%C3%B1a%2C_2022-07-14%2C_DD_14.jpg",
    habitats: ["Ακτή", "Αμμώδες"],
    methods: ["Bottom", "Surf", "Float"],
    baits: ["Δολωμένο καραβιδάκι", "Γαρίδα", "Σκουλήκι"],
    season: "Άνοιξη–Φθινόπωρο",
    minLegalSizeCm: 20,
    skill: "Εύκολο",
  },
  {
    id: "dentex",
    name: "Συναγρίδα",
    latinName: "Dentex dentex",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/c6/Dentex_dentex_357459777.jpg",
    habitats: ["Σκάφος", "Βράχια"],
    methods: ["Jigging", "Bottom"],
    baits: ["Ζωντανό δόλωμα", "Slow jig"],
    season: "Καλοκαίρι–Φθινόπωρο",
    minLegalSizeCm: 35,
    skill: "Προχωρημένο",
  },
  {
    id: "mullus",
    name: "Μπαρμπούνι",
    latinName: "Mullus barbatus",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e9/Red_Mullet_%28Mullus_barbatus%29.jpg",
    habitats: ["Ακτή", "Αμμώδες"],
    methods: ["Bottom", "Surf"],
    baits: ["Σκουλήκι", "Γαρίδα"],
    season: "Άνοιξη–Καλοκαίρι",
    minLegalSizeCm: 11,
    skill: "Εύκολο",
  },
  {
    id: "octopus",
    name: "Χταπόδι",
    latinName: "Octopus vulgaris",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f2/Pulpo_com%C3%BAn_%28Octopus_vulgaris%29%2C_Parque_natural_de_la_Arr%C3%A1bida%2C_Portugal%2C_2020-07-31%2C_DD_107.jpg",
    habitats: ["Βράχια", "Ακτή"],
    methods: ["Eging", "Bottom"],
    baits: ["Egi", "Καλαμάρι ως δόλωμα"],
    season: "Φθινόπωρο–Χειμώνας",
    minLegalSizeCm: null,
    skill: "Μέτριο",
  },
];

const CHIP_FILTERS = [
  { key: "Ακτή", type: "habitat" as const },
  { key: "Σκάφος", type: "habitat" as const },
  { key: "Βράχια", type: "habitat" as const },
  { key: "Αμμώδες", type: "habitat" as const },
  { key: "Spinning", type: "method" as const },
  { key: "Eging", type: "method" as const },
  { key: "Surf", type: "method" as const },
  { key: "Jigging", type: "method" as const },
  { key: "Bottom", type: "method" as const },
  { key: "Εύκολο", type: "skill" as const },
  { key: "Μέτριο", type: "skill" as const },
  { key: "Προχωρημένο", type: "skill" as const },
];

export default function SpeciesGuideScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Species | null>(null);

  const toggleFilter = (key: string) =>
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_SPECIES.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.latinName.toLowerCase().includes(q) ||
        s.baits.join(" ").toLowerCase().includes(q) ||
        s.methods.join(" ").toLowerCase().includes(q);

      if (!matchesQuery) return false;
      if (activeFilters.length === 0) return true;

      return activeFilters.some(
        (f) =>
          s.habitats.includes(f as any) ||
          s.methods.includes(f as any) ||
          s.skill === f
      );
    }).sort((a, b) => Number(favorites[b.id]) - Number(favorites[a.id]));
  }, [query, activeFilters, favorites]);

  const renderCard = ({ item }: { item: Species }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => setSelected(item)}
    >
      <View style={styles.cardMedia}>
        <Image
          source={{ uri: item.image }}
          style={styles.modalImg}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.cardOverlay} />
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() =>
            setFavorites((f) => ({ ...f, [item.id]: !f[item.id] }))
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={favorites[item.id] ? "heart" : "heart-outline"}
            size={20}
            color={favorites[item.id] ? colors.accent : colors.white}
          />
        </TouchableOpacity>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.latinName}</Text>
          <View style={styles.tagRow}>
            {item.habitats.slice(0, 2).map((h) => (
              <View key={h} style={styles.tag}>
                <Text style={styles.tagText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Οδηγός Ειδών</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setQuery("")}>
            <Ionicons name="refresh" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={"#9BA3AF"} />
        <TextInput
          placeholder="Αναζήτηση: όνομα, τεχνική, δόλωμα…"
          placeholderTextColor="#9BA3AF"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {CHIP_FILTERS.map(({ key }) => {
          const active = activeFilters.includes(key);
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleFilter(key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={renderCard}
        ListEmptyComponent={
          <View style={{ alignItems: "center", padding: 32 }}>
            <Ionicons name="fish-outline" size={24} color="#9BA3AF" />
            <Text style={{ color: "#9BA3AF", marginTop: 8 }}>
              Δεν βρέθηκαν αποτελέσματα
            </Text>
          </View>
        }
      />

      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selected && (
              <>
                <View style={styles.modalMedia}>
                  <Image
                    source={{ uri: selected.image }}
                    style={styles.modalImg}
                    resizeMode="cover"
                    onError={(e: any) =>
                      console.log("modal image error:", e.nativeEvent)
                    }
                  />
                  <View style={styles.modalOverlay} />
                  <TouchableOpacity
                    onPress={() => setSelected(null)}
                    style={styles.modalClose}
                  >
                    <Ionicons name="close" size={20} color={colors.white} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  contentContainerStyle={{ padding: 16, gap: 10 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.modalTitle}>{selected.name}</Text>
                  <Text style={styles.modalSubtitle}>{selected.latinName}</Text>

                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Habitat</Text>
                    <View style={styles.badgeRow}>
                      {selected.habitats.map((h) => (
                        <View key={h} style={styles.badge}>
                          <Text style={styles.badgeText}>{h}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Τεχνικές</Text>
                    <View style={styles.badgeRow}>
                      {selected.methods.map((m) => (
                        <View key={m} style={styles.badge}>
                          <Text style={styles.badgeText}>{m}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Δολώματα/Τεχνητά</Text>
                    <View style={styles.badgeRow}>
                      {selected.baits.map((b) => (
                        <View key={b} style={styles.badge}>
                          <Text style={styles.badgeText}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Εποχικότητα</Text>
                    <Text style={styles.sectionText}>{selected.season}</Text>
                  </View>

                  {typeof selected.minLegalSizeCm === "number" && (
                    <View style={styles.warnBox}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={18}
                        color={colors.white}
                      />
                      <Text style={styles.warnText}>
                        Ελάχιστο ενδεικτικό μέγεθος: {selected.minLegalSizeCm}{" "}
                        cm
                      </Text>
                    </View>
                  )}

                  <View style={{ height: 6 }} />

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() =>
                      setFavorites((f) => ({
                        ...f,
                        [selected.id]: !f[selected.id],
                      }))
                    }
                  >
                    <Ionicons
                      name={favorites[selected.id] ? "heart" : "heart-outline"}
                      size={18}
                      color={colors.primaryBg}
                    />
                    <Text style={styles.primaryBtnText}>
                      {favorites[selected.id]
                        ? "Αγαπημένο"
                        : "Προσθήκη στα αγαπημένα"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CARD_RADIUS = 14;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryBg },
  headerRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Search
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: colors.white, fontSize: 15 },

  // Chips
  chipsRow: { paddingHorizontal: 10, paddingBottom: 6, gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 6,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  chipTextActive: { color: colors.primaryBg },

  // Card
  card: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardMedia: {
    width: "100%",
    aspectRatio: 1.35, // >>> δίνει σαφές ύψος στο media
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    position: "relative",
  },
  cardImg: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  favBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
  },
  cardInfo: { position: "absolute", left: 12, right: 12, bottom: 10 },
  cardTitle: { color: colors.white, fontSize: 16, fontWeight: "800" },
  cardSubtitle: { color: "#CBD5E1", fontSize: 12, marginTop: 2 },
  tagRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  tagText: { color: colors.white, fontSize: 11, fontWeight: "600" },

  // Modal
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
  modalImg: { ...StyleSheet.absoluteFillObject },
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
  modalTitle: { color: colors.white, fontSize: 20, fontWeight: "800" },
  modalSubtitle: { color: "#9BA3AF", fontSize: 13, marginBottom: 4 },
  section: { gap: 8, marginTop: 8 },
  sectionLabel: { color: "#CBD5E1", fontSize: 12, letterSpacing: 0.3 },
  sectionText: { color: colors.white, fontSize: 14, lineHeight: 20 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  warnBox: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  warnText: { color: colors.white, fontSize: 13, flex: 1 },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnText: {
    color: colors.primaryBg,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});
