// app/(drawer)/catches/index.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { colors } from "../src/theme/colors";

type PhotoRef = {
  key: string;
  url?: string;
  contentType?: string;
  size?: number;
};
type SpotRef = { name?: string; lat?: number; lon?: number };
type CatchItem = {
  id: string;
  species: string;
  weight?: number | null;
  length?: number | null;
  notes?: string;
  photo?: PhotoRef;
  spot?: SpotRef;
  capturedAt?: string | null; // ISO
  createdAt?: string; // ISO
};

/** Διαβάζουμε το base από Expo Constants */
const RAW_BASE =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE ?? "http://localhost:3000";

/** Κανονικοποίηση base URL + ειδική μεταχείριση για Android emulator */
function normalizeBase(base: string) {
  if (!base) return base;
  let b = base.trim().replace(/\/+$/, "");

  console.log(
    "🌊 Catches API base - Original:",
    base,
    "Platform:",
    Platform.OS
  );

  // Για Android emulator/συσκευή σε mobile hotspot, αντικατάστησε με το IP του host dev μηχανήματος
  if (Platform.OS === "android") {
    if (b.includes("localhost") || b.includes("127.0.0.1")) {
      b = b
        .replace("localhost", "10.120.42.28")
        .replace("127.0.0.1", "10.120.42.28");
      console.log(
        "🌊 Catches API - Android: localhost -> 10.120.42.28 (mobile hotspot)"
      );
    } else if (b.includes("192.168.") || b.includes("10.0.2.2")) {
      b = b
        .replace(/192\.168\.\d+\.\d+/, "10.120.42.28")
        .replace("10.0.2.2", "10.120.42.28");
      console.log(
        "🌊 Catches API - Android: network IP -> 10.120.42.28 (mobile hotspot)"
      );
    }
  }

  console.log("🌊 Catches API - Final base:", b);
  return b;
}

const API_BASE = normalizeBase(RAW_BASE);

/** CDN base - hardcoded for testing */
const RAW_CDN = "https://pub-6152823702fd4064a507eac85c165f45.r2.dev";
console.log("🔍 Debug CDN - Constants.expoConfig:", Constants.expoConfig);
console.log("🔍 Debug CDN - extra:", Constants.expoConfig?.extra);
console.log(
  "🔍 Debug CDN - process.env.EXPO_PUBLIC_CDN_BASE:",
  process.env.EXPO_PUBLIC_CDN_BASE
);
console.log("🔍 Debug CDN - RAW_CDN:", RAW_CDN);

const CDN_BASE = RAW_CDN.replace(/\/+$/, "");

const PAGE_SIZE = 20;

export default function CatchesScreen() {
  const insets = useSafeAreaInsets();

  // Debug CDN configuration when component mounts
  console.log("🔍 Debug CDN - Constants.expoConfig:", Constants.expoConfig);
  console.log("🔍 Debug CDN - extra:", Constants.expoConfig?.extra);
  console.log(
    "🔍 Debug CDN - process.env.EXPO_PUBLIC_CDN_BASE:",
    process.env.EXPO_PUBLIC_CDN_BASE
  );
  console.log("🔍 Debug CDN - RAW_CDN:", RAW_CDN);
  console.log("🌐 CDN_BASE configured as:", CDN_BASE || "(empty)");

  const [items, setItems] = useState<CatchItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoadMore = useMemo(() => {
    if (total == null) return false;
    return items.length < total;
  }, [items.length, total]);

  const buildImageUrl = (p?: PhotoRef) => {
    // 1) Αν δεν υπάρχει photo ref → no image
    if (!p) return null;

    // 2) Έλεγχος και διόρθωση URL από τον server
    if (p.url && /https?:\/\//.test(p.url)) {
      let fixedUrl = p.url;
      console.log("🔧 Original server URL:", fixedUrl);

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
          console.log("🔧 Fixed with CDN domain:", fixedUrl);
        }
      }

      // Fix 4: Έλεγχος για άλλα προβληματικά domains
      if (fixedUrl.includes("cdn.psaraki.app")) {
        // Αν το custom domain δεν λειτουργεί, χρήσε το CDN
        const keyMatch = fixedUrl.match(/(original\/.*)/);
        if (keyMatch && CDN_BASE) {
          fixedUrl = `${CDN_BASE}/${keyMatch[1]}`;
          console.log("🔧 Replaced broken domain with CDN:", fixedUrl);
        }
      }

      console.log("🖼️ Using fixed server URL:", fixedUrl);
      return fixedUrl;
    }

    // 3) Fallback: Αν έχουμε key, χτίζουμε με CDN_BASE
    if (p.key && CDN_BASE) {
      const base = CDN_BASE.replace(/\/+$/, "");
      const keyPath = p.key.replace(/^\/+/, "");
      const url = `${base}/${keyPath}`;
      console.log("🖼️ Using CDN_BASE + key:", url);
      return url;
    }

    console.log("🖼️ No valid image URL available.");
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

  const loadPage = useCallback(
    async (pageNum: number, replace = false) => {
      try {
        if (pageNum === 1) setError(null);
        const url = `${API_BASE}/api/catches?limit=${PAGE_SIZE}&page=${pageNum}`;
        console.log("📋 Loading catches page:", pageNum, "URL:", url);

        const res = await fetch(url);
        console.log("📋 Catches response status:", res.status);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log("📋 Catches data received:", json);

        if (json.items && json.items.length > 0) {
          console.log("📋 First item photo details:", json.items[0].photo);
        }

        const { items: newItems, total: newTotal } = json;
        setTotal(newTotal ?? newItems?.length ?? 0);
        setItems((prev) => (replace ? newItems : [...prev, ...newItems]));
        setPage(pageNum);
        console.log(
          "📋 Catches loaded successfully:",
          newItems?.length,
          "items"
        );
      } catch (e: any) {
        console.log("❌ Error loading catches:", e);
        setError(e?.message ?? "Αποτυχία φόρτωσης");
      } finally {
        setLoading(false);
        setFetchingMore(false);
        setRefreshing(false);
      }
    },
    [API_BASE]
  );

  useEffect(() => {
    loadPage(1, true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPage(1, true);
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    if (loading || fetchingMore || !canLoadMore) return;
    setFetchingMore(true);
    loadPage(page + 1, false);
  }, [loading, fetchingMore, canLoadMore, page, loadPage]);

  const renderCard = ({ item }: { item: CatchItem }) => {
    const img = buildImageUrl(item.photo);
    console.log("🎴 Rendering card for:", item.species, "img URL:", img);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          Alert.alert(item.species, "Λεπτομέρειες coming soon");
        }}
      >
        <ImageBackground
          source={img ? { uri: img } : undefined}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}
          defaultSource={undefined}
          onError={(error) => {
            console.log("❌ preview load error:", img, error.nativeEvent);
          }}
          onLoad={() => {
            console.log("✅ preview loaded:", img);
          }}
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
