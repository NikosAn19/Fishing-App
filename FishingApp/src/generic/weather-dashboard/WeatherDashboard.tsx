import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

// Components
import WeatherDashboardAmbientBackground from "./components/WeatherDashboardAmbientBackground/WeatherDashboardAmbientBackground";
import WeatherDashboardLocationHeader from "./components/WeatherDashboardLocationHeader/WeatherDashboardLocationHeader";
import WeatherDashboardDaySelector from "./components/WeatherDashboardDaySelector/WeatherDashboardDaySelector";
import WeatherDashboardMainCard from "./components/WeatherDashboardMainCard/WeatherDashboardMainCard";
import WeatherDashboardTideChart from "./components/WeatherDashboardTideChart/WeatherDashboardTideChart";
import WeatherDashboardHourlyForecast from "./components/WeatherDashboardHourlyForecast/WeatherDashboardHourlyForecast";
import WeatherDashboardStatsGrid from "./components/WeatherDashboardStatsGrid/WeatherDashboardStatsGrid";
import WeatherDashboardSunriseSunset from "./components/WeatherDashboardSunriseSunset/WeatherDashboardSunriseSunset";
import MapNavPopup from "./components/MapNavPopup/MapNavPopup";
import ErrorState from "../../generic/common/ErrorState";

// Hooks
import { useCurrentLocation } from "../../features/location/hooks/useCurrentLocation";
import { useForecast } from "../../features/forecast/hooks/useForecast";
import { useReverseGeocode } from "../../features/location/hooks/useReverseGeocode";

// Mappers
import {
  mapLocationHeader,
  mapDaySelector,
  mapMainCard,
  mapHourlyForecast,
  mapStatsGrid,
  mapSunriseSunset,
} from "./mappers/toWeatherDashboard";

// Theme
import { colors } from "../../theme/colors";

export default function WeatherDashboard() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const searchParams = useLocalSearchParams();

  // Read coordinates from URL params if available
  const urlLat = searchParams.lat
    ? parseFloat(searchParams.lat as string)
    : undefined;
  const urlLon = searchParams.lon
    ? parseFloat(searchParams.lon as string)
    : undefined;

  // Get current location (if no URL params)
  const {
    coords,
    loading: locationLoading,
    error: locationError,
  } = useCurrentLocation();

  // Priority: URL params > current location
  const forecastLat = urlLat ?? coords?.lat;
  const forecastLon = urlLon ?? coords?.lon;

  const locationText = useReverseGeocode(forecastLat, forecastLon);

  // Get forecast data
  const {
    data: forecast,
    loading: forecastLoading,
    error: forecastError,
  } = useForecast(forecastLat, forecastLon);

  // Get selected date for day-specific forecast
  const selectedDate = useMemo(() => {
    if (!forecast) return undefined;
    const days = mapDaySelector(forecast);
    const selectedDay = days[selectedDayIndex];
    if (!selectedDay) return undefined;

    const today = new Date();
    today.setDate(today.getDate() + selectedDayIndex);
    return today.toISOString().split("T")[0]; // YYYY-MM-DD format
  }, [forecast, selectedDayIndex]);

  // Get forecast for selected date if not today
  const { data: selectedDateForecast, loading: selectedDateLoading } =
    useForecast(coords?.lat, coords?.lon, {
      date: selectedDayIndex > 0 ? selectedDate : undefined,
    });

  // Use selected date forecast if available, otherwise use current forecast
  const activeForecast = selectedDateForecast || forecast;

  const loading = locationLoading || forecastLoading || selectedDateLoading;
  const error = locationError || forecastError;

  // Map data using mappers
  const locationHeader = useMemo(() => {
    if (!activeForecast) return null;
    return mapLocationHeader(activeForecast, locationText);
  }, [activeForecast, locationText]);

  const daySelectorData = useMemo(() => {
    if (!forecast) return [];
    return mapDaySelector(forecast);
  }, [forecast]);

  const mainCardData = useMemo(() => {
    if (!activeForecast) return null;
    return mapMainCard(activeForecast);
  }, [activeForecast]);

  const hourlyData = useMemo(() => {
    if (!activeForecast) return [];
    return mapHourlyForecast(activeForecast, selectedDate);
  }, [activeForecast, selectedDate]);

  const statsData = useMemo(() => {
    if (!activeForecast) return [];
    return mapStatsGrid(activeForecast);
  }, [activeForecast]);

  const sunriseSunsetData = useMemo(() => {
    if (!activeForecast) return null;
    return mapSunriseSunset(activeForecast);
  }, [activeForecast]);

  const handleLocationSelect = (location: string) => {
    if (location === "current") {
      // Navigate to home screen without URL params to use current location
      router.push("/");
    } else {
      // For other location types (favorites, etc.), handle here
      console.log("Selected location:", location);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.palette.emerald[400]} />
        <Text style={styles.loadingText}>Φόρτωση δεδομένων...</Text>
      </View>
    );
  }

  // Error state
  if (error || !activeForecast) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" />
        <ErrorState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <WeatherDashboardAmbientBackground />

      <SafeAreaView
        style={[styles.safeArea, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Header */}
        <View style={styles.header}>
          {locationHeader && (
            <WeatherDashboardLocationHeader
              locationLabel={locationHeader.locationLabel}
              locationText={locationHeader.locationText}
              onAnchorPress={() => setShowLocationPicker(true)}
            />
          )}
          <View style={styles.daySelectorContainer}>
            <WeatherDashboardDaySelector
              days={daySelectorData}
              selectedIndex={selectedDayIndex}
              onDaySelect={setSelectedDayIndex}
            />
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {mainCardData && (
            <WeatherDashboardMainCard
              condition={mainCardData.condition}
              iconKey={mainCardData.iconKey}
              isDaytime={mainCardData.isDaytime}
              temp={mainCardData.temp}
              high={mainCardData.high}
              low={mainCardData.low}
              score={mainCardData.score}
              statusItems={mainCardData.statusItems}
            />
          )}

          <WeatherDashboardTideChart
            title="Παλίρροια"
            nextHighTide="23:15"
            nextLowTide="05:30"
          />

          <WeatherDashboardHourlyForecast hourlyData={hourlyData} />

          <WeatherDashboardStatsGrid stats={statsData} />

          {sunriseSunsetData && (
            <WeatherDashboardSunriseSunset
              sunrise={sunriseSunsetData.sunrise}
              sunset={sunriseSunsetData.sunset}
            />
          )}
          {/* Spacer to prevent content from touching the bottom menu */}
          <View style={{ height: 40 + insets.bottom }} />
        </ScrollView>
      </SafeAreaView>

      {/* Location Picker Popup */}
      <MapNavPopup
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.palette.slate[950],
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: colors.palette.slate[400],
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "column",
    zIndex: 10,
  },
  daySelectorContainer: {
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
