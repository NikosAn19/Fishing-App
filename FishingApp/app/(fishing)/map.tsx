import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import FishingMapView from "../../src/features/maps/components/MapView";
import CenterCrosshair from "../../src/features/maps/components/CenterCrosshair/CenterCrosshair";
import SelectButton from "../../src/features/maps/components/SelectButton/SelectButton";
import QuickForecastCard from "../../src/features/maps/components/QuickForecastCard/QuickForecastCard";
import { MapMode } from "../../src/features/maps/types/maps";
import { FavoriteSpot } from "../../src/features/maps/types/maps";
import { Region } from "react-native-maps";
import { useFavoriteSpots } from "../../src/features/maps/hooks/useFavoriteSpots";

export default function MapPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const mode = (searchParams.mode as MapMode | undefined) ?? "normal";
  const spotIdFromUrl = searchParams.spotId as string | undefined;
  const latFromUrl = searchParams.lat
    ? parseFloat(searchParams.lat as string)
    : undefined;
  const lonFromUrl = searchParams.lon
    ? parseFloat(searchParams.lon as string)
    : undefined;

  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [showQuickForecast, setShowQuickForecast] = useState(false);
  const [selectedFavoriteSpot, setSelectedFavoriteSpot] =
    useState<FavoriteSpot | null>(null);
  // Track which spot/coordinates have been initialized (by key)
  const initializedKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { favoriteSpots, deleteFavoriteSpot } = useFavoriteSpots({
    autoLoad: true,
  });

  // Compute initial region from URL params to focus on a specific spot
  // Memoize to prevent creating new object on every render
  const initialRegion: Region | undefined = useMemo(() => {
    if (latFromUrl !== undefined && lonFromUrl !== undefined) {
      return {
        latitude: latFromUrl,
        longitude: lonFromUrl,
        latitudeDelta: 0.01, // Closer zoom for specific spot
        longitudeDelta: 0.01,
      };
    }
    return undefined;
  }, [latFromUrl, lonFromUrl]);

  // Handle URL parameters to focus on a specific spot
  useEffect(() => {
    // Create a unique key for this navigation
    const currentKey =
      spotIdFromUrl ||
      (latFromUrl !== undefined && lonFromUrl !== undefined
        ? `coords_${latFromUrl.toFixed(6)}_${lonFromUrl.toFixed(6)}`
        : null);

    // Reset if navigating to a different spot
    if (currentKey && initializedKeyRef.current !== currentKey) {
      // Clear previous timeout if exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Reset QuickForecastCard visibility
      setShowQuickForecast(false);

      // Don't return yet - we want to process this new spot
    } else if (initializedKeyRef.current === currentKey) {
      // Already initialized for this spot
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (spotIdFromUrl && favoriteSpots.length > 0) {
      // Find the favorite spot by ID
      const spot = favoriteSpots.find((s) => s.id === spotIdFromUrl);
      if (spot) {
        // Use the spot's coordinates (more accurate than URL params)
        setSelectedFavoriteSpot(spot);
        setSelectedCoordinates({
          lat: spot.latitude,
          lon: spot.longitude,
        });

        // Mark as initialized for this spot
        initializedKeyRef.current = spotIdFromUrl;

        // Delay showing QuickForecastCard until after map animation completes
        // Animation duration is 1000ms, so wait slightly longer (1100ms)
        timeoutRef.current = setTimeout(() => {
          setShowQuickForecast(true);
          timeoutRef.current = null;
        }, 1100);
      }
    } else if (latFromUrl !== undefined && lonFromUrl !== undefined) {
      // If coordinates provided but no spot ID, just set coordinates
      setSelectedCoordinates({
        lat: latFromUrl,
        lon: lonFromUrl,
      });
      initializedKeyRef.current = currentKey || "coordinates";
    }

    return () => {
      // Cleanup: only clear timeout if this effect is cleaning up
      // But don't clear if we're just updating state for a new spot
      if (timeoutRef.current && initializedKeyRef.current !== currentKey) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [spotIdFromUrl, latFromUrl, lonFromUrl, favoriteSpots]);

  const handleMapPress = (event: any) => {
    // Map tapping should not select spots - user must use SelectButton
    // Do nothing
  };

  const handleMarkerPress = (marker: any) => {
    if (marker.id) {
      // This is a favorite spot marker - show QuickForecastCard with spot data
      const favoriteSpot = favoriteSpots.find((spot) => spot.id === marker.id);
      if (favoriteSpot) {
        setSelectedFavoriteSpot(favoriteSpot);
        setSelectedCoordinates({
          lat: favoriteSpot.latitude,
          lon: favoriteSpot.longitude,
        });
        setShowQuickForecast(true);
      }
    } else {
      // This is the current location marker - do nothing
    }
  };

  const handleRegionChangeComplete = (region: Region) => {
    // Always update selected coordinates when region changes, regardless of mode
    setSelectedCoordinates({
      lat: region.latitude,
      lon: region.longitude,
    });
  };

  const handleSelectPress = () => {
    if (selectedCoordinates) {
      // Clear favorite spot when selecting new location
      setSelectedFavoriteSpot(null);
      setShowQuickForecast(true);
    }
  };

  const handleViewFullForecast = () => {
    if (selectedFavoriteSpot) {
      // Navigate with favorite spot coordinates
      router.push(
        `/?lat=${selectedFavoriteSpot.latitude}&lon=${selectedFavoriteSpot.longitude}`
      );
    } else if (selectedCoordinates) {
      // Navigate with selected coordinates
      router.push(
        `/?lat=${selectedCoordinates.lat}&lon=${selectedCoordinates.lon}`
      );
    }
  };

  const handleSaveFavorite = async (
    name: string,
    coordinates: { lat: number; lon: number }
  ) => {
    // This will be handled by QuickForecastCard using the hook
  };

  const handleDeleteFavorite = async (id: string) => {
    try {
      await deleteFavoriteSpot(id);
      setSelectedFavoriteSpot(null);
      setShowQuickForecast(false);
    } catch (error) {
      console.error("Failed to delete favorite spot:", error);
    }
  };

  const handleCloseQuickForecast = () => {
    setShowQuickForecast(false);
    setSelectedFavoriteSpot(null);
  };

  return (
    <View
      style={[
        styles.container,
        {
          marginTop: -5, // Small negative margin to overlap with header shadow
          paddingBottom: 85 + insets.bottom, // Bottom menu height + safe area
        },
      ]}
    >
      <FishingMapView
        onMapPress={handleMapPress}
        onMarkerPress={handleMarkerPress}
        onRegionChangeComplete={handleRegionChangeComplete}
        favoriteSpots={favoriteSpots}
        initialRegion={initialRegion}
      />

      {/* Always show crosshair */}
      <CenterCrosshair visible={true} />

      {/* Always show SelectButton when coordinates are available */}
      {selectedCoordinates && (
        <SelectButton
          onPress={handleSelectPress}
          disabled={!selectedCoordinates}
        />
      )}

      {/* Show QuickForecastCard when user selects location or taps favorite spot */}
      {showQuickForecast && selectedCoordinates && (
        <QuickForecastCard
          coordinates={selectedCoordinates}
          onViewFull={handleViewFullForecast}
          onSaveFavorite={selectedFavoriteSpot ? undefined : handleSaveFavorite}
          onClose={handleCloseQuickForecast}
          favoriteSpot={selectedFavoriteSpot ?? undefined}
          onDelete={selectedFavoriteSpot ? handleDeleteFavorite : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
