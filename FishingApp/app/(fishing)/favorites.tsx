import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, ChevronRight } from "lucide-react-native";
import { colors } from "../../src/theme/colors";
import { useFavoriteSpots } from "../../src/features/maps/hooks/useFavoriteSpots";
import { FavoriteSpot } from "../../src/features/maps/types/maps";

export default function FavoriteSpotsListPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favoriteSpots, loading, loadFavoriteSpots } = useFavoriteSpots({
    autoLoad: true,
  });

  useEffect(() => {
    loadFavoriteSpots();
  }, [loadFavoriteSpots]);

  const handleSpotPress = (spot: FavoriteSpot) => {
    // Navigate to map with spot coordinates to focus on it
    router.push(
      `/map?lat=${spot.latitude}&lon=${spot.longitude}&spotId=${spot.id}`
    );
  };

  const renderSpotItem = ({ item }: { item: FavoriteSpot }) => (
    <TouchableOpacity
      style={styles.spotItem}
      onPress={() => handleSpotPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.spotIconContainer}>
        <MapPin size={24} color={colors.palette.amber[400]} />
      </View>
      <View style={styles.spotContent}>
        <Text style={styles.spotName}>{item.name}</Text>
        {item.address && (
          <Text style={styles.spotAddress} numberOfLines={1}>
            {item.address}
          </Text>
        )}
        {item.description && (
          <Text style={styles.spotDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
      <ChevronRight size={20} color={colors.palette.slate[500]} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.palette.emerald[400]} />
        <Text style={styles.loadingText}>Φόρτωση αγαπημένων...</Text>
      </View>
    );
  }

  if (favoriteSpots.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MapPin size={48} color={colors.palette.slate[500]} />
        <Text style={styles.emptyTitle}>Δεν υπάρχουν αγαπημένα σημεία</Text>
        <Text style={styles.emptySubtitle}>
          Προσθέστε αγαπημένα σημεία από τον χάρτη
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: 85 + insets.bottom, // Bottom menu height
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Αγαπημένα Σημεία</Text>
        <Text style={styles.headerSubtitle}>
          {favoriteSpots.length}{" "}
          {favoriteSpots.length === 1
            ? "αποθηκευμένο σημείο"
            : "αποθηκευμένα σημεία"}
        </Text>
      </View>

      <FlatList
        data={favoriteSpots}
        renderItem={renderSpotItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.palette.slate[400],
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  spotItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.palette.slate[900] + "99",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.palette.slate[800],
  },
  spotIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.palette.amber[400] + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  spotContent: {
    flex: 1,
  },
  spotName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  spotAddress: {
    fontSize: 12,
    color: colors.palette.slate[400],
    marginBottom: 2,
  },
  spotDescription: {
    fontSize: 12,
    color: colors.palette.slate[500],
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.palette.slate[400],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.palette.slate[400],
    textAlign: "center",
  },
});
