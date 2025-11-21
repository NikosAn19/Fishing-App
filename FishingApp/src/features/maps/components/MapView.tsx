import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useLocationStore } from "../../location/stores/locationStore";
import { MapViewProps, MapTypeEnum, FavoriteSpot } from "../types/maps";

export default function FishingMapView({
  onMapPress,
  onMarkerPress,
  onRegionChangeComplete,
  favoriteSpots = [],
  initialRegion,
}: MapViewProps) {
  const [mapType, setMapType] = useState<MapTypeEnum>(MapTypeEnum.HYBRID);
  const [mapReady, setMapReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const hasAnimatedToInitialRegionRef = useRef(false);
  const previousInitialRegionRef = useRef<string | null>(null);

  const {
    currentLocation,
    isLoading,
    error,
    hasPermission,
    getCurrentLocation,
    requestPermissions,
    setLoading,
    setError,
  } = useLocationStore();

  // Default region (Athens, Greece) as fallback
  const defaultRegion: Region = {
    latitude: 37.9755,
    longitude: 23.7348,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  // Use current location or default region for MapView's initialRegion
  // We DON'T use initialRegion prop here because we want to animate TO it
  // If we set it as initialRegion, the map jumps there immediately with no animation
  const mapRegion: Region = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05, // Zoomed out to show ~5-10km radius
        longitudeDelta: 0.05,
      }
    : defaultRegion;

  // Simple location initialization
  useEffect(() => {
    console.log("Component mounted, requesting location...");
    setLocalLoading(true);

    const timeout = setTimeout(() => {
      console.log("Location timeout, hiding loading");
      setLocalLoading(false);
    }, 5000);

    if (!hasPermission) {
      requestPermissions().finally(() => {
        clearTimeout(timeout);
        setLocalLoading(false);
      });
    } else if (!currentLocation) {
      getCurrentLocation().finally(() => {
        clearTimeout(timeout);
        setLocalLoading(false);
      });
    } else {
      clearTimeout(timeout);
      setLocalLoading(false);
    }

    return () => clearTimeout(timeout);
  }, []);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("State changed:", {
      isLoading,
      hasPermission,
      currentLocation: !!currentLocation,
      error,
    });

    // Force re-render when location is received
    if (currentLocation && !isLoading) {
      console.log("Location received, forcing update");
      setLocalLoading(false); // Ensure local loading is false
      setForceUpdate((prev) => prev + 1);
    }
  }, [isLoading, hasPermission, currentLocation, error]);

  // Animate to initialRegion if provided, otherwise to current location when available
  // Combined reset and animation logic to avoid race conditions
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    if (initialRegion) {
      // Create a key from the region coordinates
      const regionKey = `${initialRegion.latitude.toFixed(
        6
      )},${initialRegion.longitude.toFixed(6)}`;

      // Check if this is a different region than what we've animated to
      if (previousInitialRegionRef.current !== regionKey) {
        // Reset tracking refs to ensure animation triggers
        previousInitialRegionRef.current = null;
        hasAnimatedToInitialRegionRef.current = false;

        // Small delay to ensure map is fully rendered at its initial position
        // This ensures we animate FROM the current position TO the target
        const timeoutId = setTimeout(() => {
          if (mapRef.current && mapReady) {
            mapRef.current.animateToRegion(initialRegion, 1000);
            previousInitialRegionRef.current = regionKey;
            hasAnimatedToInitialRegionRef.current = true;
          }
        }, 200); // Delay to ensure map is ready and positioned

        return () => clearTimeout(timeoutId);
      }
    } else if (
      currentLocation &&
      !hasAnimatedToInitialRegionRef.current &&
      !isLoading
    ) {
      // Animate to current location with zoomed out view - only once (when no initialRegion)
      const region: Region = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05, // Zoomed out view (~5-10km radius)
        longitudeDelta: 0.05,
      };
      mapRef.current.animateToRegion(region, 1000); // 1 second animation
      hasAnimatedToInitialRegionRef.current = true;
    }
  }, [
    initialRegion?.latitude,
    initialRegion?.longitude,
    mapReady,
    currentLocation,
    isLoading,
  ]);

  const toggleMapType = () => {
    const mapTypes = [
      MapTypeEnum.STANDARD,
      MapTypeEnum.SATELLITE,
      MapTypeEnum.HYBRID,
    ];
    const currentIndex = mapTypes.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % mapTypes.length;
    setMapType(mapTypes[nextIndex]);
  };

  const handleMapReady = () => {
    console.log("Map is ready");
    setMapReady(true);
    setMapError(false);
  };

  const handleMapError = (error: any) => {
    console.log("Map error:", error);
    setMapError(true);
  };

  const retryLocation = async () => {
    console.log("Retrying location...");
    setError(null);
    setLocalLoading(true);
    setLoading(true);

    try {
      if (!hasPermission) {
        console.log("Requesting permissions in retry...");
        await requestPermissions();
      } else {
        console.log("Getting current location in retry...");
        await getCurrentLocation();
      }
    } catch (error) {
      console.log("Retry failed:", error);
      setError("Location request failed");
      setLoading(false);
      setLocalLoading(false);
    }
  };

  const skipLocation = () => {
    console.log("Skipping location...");
    setLocalLoading(false);
    setLoading(false);
    setError(null);
  };

  return (
    <View style={styles.container}>
      {mapError ? (
        // Fallback map without Google provider
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          onPress={onMapPress}
          onMapReady={handleMapReady}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          mapType={mapType}
          loadingEnabled={true}
          loadingIndicatorColor="#12dbc0"
          moveOnMarkerPress={false}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
              description={currentLocation.address || "Current location"}
              pinColor="#12dbc0"
            />
          )}

          {/* Favorite spots markers */}
          {favoriteSpots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.latitude,
                longitude: spot.longitude,
              }}
              title={spot.name}
              description={spot.address || spot.description || "Favorite spot"}
              pinColor="#fbbf24"
              onPress={() => {
                if (onMarkerPress) {
                  onMarkerPress({
                    id: spot.id,
                    title: spot.name,
                    description:
                      spot.address || spot.description || "Favorite spot",
                    coordinate: {
                      latitude: spot.latitude,
                      longitude: spot.longitude,
                    },
                  });
                }
              }}
            />
          ))}
        </MapView>
      ) : (
        // Primary map with Google provider
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={mapRegion}
          onPress={onMapPress}
          onMapReady={handleMapReady}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          mapType={mapType}
          loadingEnabled={true}
          loadingIndicatorColor="#12dbc0"
          loadingBackgroundColor="#f5f5f5"
          moveOnMarkerPress={false}
          showsBuildings={true}
          showsTraffic={false}
          showsIndoors={true}
          showsPointsOfInterest={true}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {/* Current location marker */}
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
              description={currentLocation.address || "Current location"}
              pinColor="#12dbc0"
            />
          )}

          {/* Favorite spots markers */}
          {favoriteSpots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.latitude,
                longitude: spot.longitude,
              }}
              title={spot.name}
              description={spot.address || spot.description || "Favorite spot"}
              pinColor="#fbbf24"
              onPress={() => {
                if (onMarkerPress) {
                  onMarkerPress({
                    id: spot.id,
                    title: spot.name,
                    description:
                      spot.address || spot.description || "Favorite spot",
                    coordinate: {
                      latitude: spot.latitude,
                      longitude: spot.longitude,
                    },
                  });
                }
              }}
            />
          ))}
        </MapView>
      )}

      {/* Simple Loading Overlay */}
      {localLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Ionicons
              name="location-outline"
              size={48}
              color="#12dbc0"
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.loadingText}>Getting location...</Text>
            <TouchableOpacity style={styles.skipButton} onPress={skipLocation}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Error Overlay */}
      {error && !isLoading && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorContainer}>
            <Ionicons
              name="location-outline"
              size={48}
              color="#FF9F7A"
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryLocation}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Map Type Toggle Button */}
      <TouchableOpacity style={styles.mapTypeButton} onPress={toggleMapType}>
        <Ionicons
          name={
            mapType === MapTypeEnum.SATELLITE
              ? "earth"
              : mapType === MapTypeEnum.HYBRID
              ? "layers"
              : "map"
          }
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212B36",
  },
  map: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(33, 43, 54, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(33, 43, 54, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#12dbc0",
    textAlign: "center",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#FF9F7A",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: "#12dbc0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#212B36",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#12dbc0",
  },
  skipButtonText: {
    color: "#12dbc0",
    fontSize: 16,
    fontWeight: "600",
  },
  mapTypeButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
