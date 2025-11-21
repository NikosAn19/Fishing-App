import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useRouter } from "expo-router";
import { LocateFixed, Map, Star } from "lucide-react-native";
import { colors } from "../../../../theme/colors";
import { MapNavPopupProps } from "./types";
import { useFavoriteSpotsStore } from "../../../../features/maps/stores/favoriteSpotsStore";

export default function MapNavPopup({
  visible,
  onClose,
  onLocationSelect,
}: MapNavPopupProps) {
  const router = useRouter();
  const favoriteSpotsStore = useFavoriteSpotsStore();

  const favoriteCount = useMemo(
    () => favoriteSpotsStore.favoriteSpots.length,
    [favoriteSpotsStore.favoriteSpots]
  );

  const handleLocationPress = (location: string) => {
    if (location === "Επιλογή στον Χάρτη") {
      onClose();
      router.push("/map?mode=select");
      return;
    }

    if (location === "Τρέχουσα Τοποθεσία") {
      onLocationSelect("current");
      onClose();
      return;
    }

    // For favorites, we'll handle it separately
    onLocationSelect(location);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.bottomSheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Επιλογή Τοποθεσίας</Text>

          {/* Current Location Option */}
          <TouchableOpacity
            onPress={() => handleLocationPress("Τρέχουσα Τοποθεσία")}
            style={styles.option}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.palette.emerald[500] + "20" },
              ]}
            >
              <LocateFixed size={20} color={colors.palette.emerald[500]} />
            </View>
            <View style={[styles.optionContent, { marginLeft: 16 }]}>
              <Text style={styles.optionTitle}>Τρέχουσα Τοποθεσία</Text>
              <Text style={styles.optionSubtitle}>Χρήση GPS</Text>
            </View>
          </TouchableOpacity>

          {/* Map Selection Option */}
          <TouchableOpacity
            onPress={() => handleLocationPress("Επιλογή στον Χάρτη")}
            style={styles.option}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.palette.blue[500] + "20" },
              ]}
            >
              <Map size={20} color={colors.palette.blue[500]} />
            </View>
            <View style={[styles.optionContent, { marginLeft: 16 }]}>
              <Text style={styles.optionTitle}>Επιλογή στον Χάρτη</Text>
              <Text style={styles.optionSubtitle}>Άνοιγμα χάρτη</Text>
            </View>
          </TouchableOpacity>

          {/* Favorites Option */}
          <TouchableOpacity
            onPress={() => {
              onClose();
              router.push("/favorites");
            }}
            style={styles.option}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.palette.amber[400] + "20" },
              ]}
            >
              <Star size={20} color={colors.palette.amber[400]} />
            </View>
            <View style={[styles.optionContent, { marginLeft: 16 }]}>
              <Text style={styles.optionTitle}>Αγαπημένα</Text>
              <Text style={styles.optionSubtitle}>
                {favoriteCount}{" "}
                {favoriteCount === 1
                  ? "αποθηκευμένο σημείο"
                  : "αποθηκευμένα σημεία"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Ακύρωση</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  bottomSheet: {
    backgroundColor: colors.palette.slate[900],
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderTopColor: colors.palette.slate[800],
    paddingBottom: 40,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  handle: {
    width: 48,
    height: 4,
    backgroundColor: colors.palette.slate[800],
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.palette.slate[800] + "80",
    borderWidth: 1,
    borderColor: colors.palette.slate[800],
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: colors.palette.slate[500],
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.palette.slate[500],
  },
});
