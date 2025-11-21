import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, ExternalLink, Star, Trash2 } from "lucide-react-native";
import { colors } from "../../../../theme/colors";
import { QuickForecastCardProps } from "./types";
import { useForecast } from "../../../../features/forecast/hooks/useForecast";
import { computeForecastScore } from "../../../../features/forecast/utils/forecastMetrics";
import WeatherDashboardCircularGauge from "../../../../components/weather-dashboard/components/WeatherDashboardCircularGauge/WeatherDashboardCircularGauge";
import { useReverseGeocode } from "../../../../features/location/hooks/useReverseGeocode";
import { useFavoriteSpots } from "../../hooks/useFavoriteSpots";
import { WeatherCondition } from "../../../../features/forecast/api/types";
import { getMainIcon } from "../../../../components/weather-dashboard/utils/weatherDashboardIcons/weatherDashboardIcons";
import { getWeatherConditionInGreek } from "../../../../components/weather-dashboard/utils/weatherTranslations/weatherTranslations";
import { mapWeatherConditionToIconKey } from "../../../../components/weather-dashboard/mappers/toWeatherDashboard";
import WeatherDashboardStatCard from "../../../../components/weather-dashboard/components/WeatherDashboardStatCard/WeatherDashboardStatCard";
import { Wind, Thermometer, Navigation } from "lucide-react-native";
import { calculateBeaufort } from "../../../../components/weather-dashboard/utils/weatherCalculations/weatherCalculations";
import { safeText } from "../../../../components/weather-dashboard/utils/textUtils/textUtils";

export default function QuickForecastCard({
  coordinates,
  onViewFull,
  onSaveFavorite,
  onClose,
  favoriteSpot,
  onDelete,
}: QuickForecastCardProps) {
  const insets = useSafeAreaInsets();
  const [showNameInput, setShowNameInput] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const locationText = useReverseGeocode(coordinates.lat, coordinates.lon);
  const { createFavoriteSpot } = useFavoriteSpots();

  const {
    data: forecast,
    loading,
    error,
  } = useForecast(coordinates.lat, coordinates.lon);

  const score = forecast ? computeForecastScore(forecast) : 0;
  const temp = forecast?.current.air.temp_c ?? null;
  const windSpeed = forecast?.current.formatted.wind.display_beaufort ?? null;

  // Calculate Beaufort for wind description
  const beaufort = forecast
    ? calculateBeaufort(forecast.current.wind.speed_kn)
    : null;

  // Extract current weather condition
  const weatherCondition =
    forecast?.current.weather_condition ?? WeatherCondition.CLOUDY;
  const weatherIcon = forecast?.current.weather_icon;
  const isDaytime = weatherIcon?.endsWith("d") ?? true;
  const iconKey = mapWeatherConditionToIconKey(weatherCondition, isDaytime);
  const conditionText = getWeatherConditionInGreek(iconKey);
  const WeatherIcon = getMainIcon(iconKey, 48, isDaytime);

  // Determine location display
  const locationDisplay = favoriteSpot
    ? favoriteSpot.address ||
      `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`
    : locationText ||
      `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`;

  const handleSaveFavorite = () => {
    setShowNameInput(true);
  };

  const handleConfirmSave = async () => {
    if (!favoriteName.trim()) {
      Alert.alert("Σφάλμα", "Παρακαλώ εισάγετε όνομα για το αγαπημένο σημείο.");
      return;
    }

    try {
      await createFavoriteSpot({
        name: favoriteName.trim(),
        latitude: coordinates.lat,
        longitude: coordinates.lon,
        address: locationText || undefined,
      });
      setShowNameInput(false);
      setFavoriteName("");
      Alert.alert("Επιτυχία", "Το αγαπημένο σημείο αποθηκεύτηκε!");
      if (onSaveFavorite) {
        onSaveFavorite(favoriteName.trim(), coordinates);
      }
    } catch (error) {
      Alert.alert(
        "Σφάλμα",
        error instanceof Error ? error.message : "Αποτυχία αποθήκευσης"
      );
    }
  };

  const handleCancelSave = () => {
    setShowNameInput(false);
    setFavoriteName("");
  };

  return (
    <>
      <Modal
        visible={true}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <View
            style={[
              styles.card,
              {
                paddingBottom: 20 + insets.bottom,
              },
            ]}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={colors.white} />
            </TouchableOpacity>

            {/* Spot Name (if favorite spot) */}
            {favoriteSpot && (
              <Text style={styles.spotName}>{favoriteSpot.name}</Text>
            )}

            {/* Location */}
            <Text
              style={[
                styles.locationText,
                favoriteSpot && styles.locationTextSecondary,
              ]}
            >
              {locationDisplay}
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={colors.palette.emerald[400]}
                />
                <Text style={styles.loadingText}>Φόρτωση πρόβλεψης...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Σφάλμα φόρτωσης πρόβλεψης</Text>
              </View>
            ) : forecast ? (
              <>
                {/* Score Gauge */}
                <View style={styles.scoreContainer}>
                  <WeatherDashboardCircularGauge
                    score={score}
                    size={80}
                    label="ΔΕΙΚΤΗΣ"
                  />
                </View>

                {/* Weather Condition */}
                <View style={styles.conditionContainer}>
                  <View style={styles.conditionIconContainer}>
                    {WeatherIcon}
                  </View>
                  <Text style={styles.conditionText}>{conditionText}</Text>
                </View>

                {/* Weather Stats with Icons */}
                <View style={styles.statsContainer}>
                  {/* Temperature Stat Card */}
                  <WeatherDashboardStatCard
                    icon={Thermometer}
                    iconColor={colors.palette.indigo[400]}
                    iconBgColor={colors.palette.indigo[400] + "1A"}
                    label="Θερμοκρασία"
                    value={temp != null ? `${Math.round(temp)}°C` : "—"}
                  />

                  {/* Wind Stat Card */}
                  <WeatherDashboardStatCard
                    icon={Wind}
                    iconColor={colors.palette.blue[400]}
                    iconBgColor={colors.palette.blue[500] + "1A"}
                    label="Άνεμος"
                    value={windSpeed ?? "—"}
                    subText={
                      forecast && forecast.current.wind.dir_deg != null ? (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 2,
                          }}
                        >
                          <Navigation
                            size={8}
                            color={colors.palette.blue[400]}
                            style={{
                              transform: [
                                {
                                  rotate: `${
                                    forecast.current.wind.dir_deg ?? 0
                                  }deg`,
                                },
                              ],
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 10,
                              color: colors.palette.slate[400],
                              marginLeft: 4,
                            }}
                          >
                            {safeText(
                              forecast.current.wind.dir_cardinal || "—"
                            )}
                            {forecast.current.wind.dir_cardinal &&
                            beaufort?.description
                              ? ` • ${safeText(beaufort.description)}`
                              : ""}
                          </Text>
                        </View>
                      ) : null
                    }
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onViewFull}
                    activeOpacity={0.8}
                  >
                    <ExternalLink size={18} color={colors.white} />
                    <Text style={styles.primaryButtonText}>
                      Προβολή Πρόβλεψης
                    </Text>
                  </TouchableOpacity>

                  {!favoriteSpot && onSaveFavorite && (
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={handleSaveFavorite}
                      activeOpacity={0.8}
                    >
                      <Star size={18} color={colors.palette.amber[400]} />
                      <Text style={styles.secondaryButtonText}>
                        Αποθήκευση ως Αγαπημένο
                      </Text>
                    </TouchableOpacity>
                  )}

                  {favoriteSpot && onDelete && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          "Διαγραφή Αγαπημένου",
                          `Είστε σίγουροι ότι θέλετε να διαγράψετε το "${favoriteSpot.name}";`,
                          [
                            { text: "Ακύρωση", style: "cancel" },
                            {
                              text: "Διαγραφή",
                              style: "destructive",
                              onPress: () => {
                                onDelete(favoriteSpot.id);
                                onClose();
                              },
                            },
                          ]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={18} color={colors.palette.red[400]} />
                      <Text style={styles.deleteButtonText}>
                        Διαγραφή Αγαπημένου
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Name Input Modal */}
      {showNameInput && (
        <Modal
          visible={showNameInput}
          transparent
          animationType="fade"
          onRequestClose={handleCancelSave}
        >
          <View style={styles.inputModalContainer}>
            <TouchableOpacity
              style={styles.inputBackdrop}
              activeOpacity={1}
              onPress={handleCancelSave}
            />
            <View style={styles.inputCard}>
              <Text style={styles.inputTitle}>Όνομα Αγαπημένου Σημείου</Text>
              <TextInput
                style={styles.input}
                value={favoriteName}
                onChangeText={setFavoriteName}
                placeholder="π.χ. Λίμνη Πλαστήρα"
                placeholderTextColor={colors.palette.slate[500]}
                autoFocus
                maxLength={50}
              />
              <View style={styles.inputActions}>
                <TouchableOpacity
                  style={styles.inputCancelButton}
                  onPress={handleCancelSave}
                >
                  <Text style={styles.inputCancelText}>Ακύρωση</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.inputConfirmButton}
                  onPress={handleConfirmSave}
                >
                  <Text style={styles.inputConfirmText}>Αποθήκευση</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  card: {
    backgroundColor: colors.palette.slate[900],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: colors.palette.slate[800],
    paddingTop: 24,
    paddingHorizontal: 24,
    maxHeight: "70%",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.palette.slate[800] + "80",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  spotName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 20,
    textAlign: "center",
  },
  locationTextSecondary: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.palette.slate[400],
    marginBottom: 20,
  },
  conditionContainer: {
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  conditionIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  conditionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    color: colors.palette.slate[400],
    fontSize: 14,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    color: colors.palette.amber[400],
    fontSize: 14,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: colors.palette.emerald[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: colors.palette.slate[800],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.palette.slate[700],
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.palette.amber[400],
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: colors.palette.slate[800],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.palette.slate[700],
    gap: 8,
  },
  deleteButtonText: {
    color: colors.palette.red[400],
    fontSize: 16,
    fontWeight: "600",
  },
  inputModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  inputCard: {
    backgroundColor: colors.palette.slate[900],
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.palette.slate[800],
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.palette.slate[800],
    borderRadius: 8,
    padding: 12,
    color: colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.palette.slate[700],
    marginBottom: 20,
  },
  inputActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  inputCancelButton: {
    flex: 1,
    backgroundColor: colors.palette.slate[800],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.palette.slate[700],
  },
  inputCancelText: {
    color: colors.palette.slate[400],
    fontSize: 14,
    fontWeight: "600",
  },
  inputConfirmButton: {
    flex: 1,
    backgroundColor: colors.palette.emerald[500],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  inputConfirmText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});
