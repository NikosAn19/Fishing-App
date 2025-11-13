import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Region, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { colors } from "../../theme/colors";
import { MapPin, Navigation, Check, Layers } from "lucide-react-native";
import { useCurrentLocation } from "../../features/location/hooks/useCurrentLocation";
import { useReverseGeocode } from "../../features/location/hooks/useReverseGeocode";
import { MapTypeEnum } from "../../types/ui";

const { width, height } = Dimensions.get("window");

// Clean Glass Morphism Styling - No Shadows
const getUltraGlassStyle = (
  variant: "default" | "premium" | "accent" | "subtle" = "default"
) => {
  const variants = {
    default: {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.18)",
      // No shadows to eliminate dark center effect
    },
    premium: {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.25)",
      // No shadows to eliminate dark center effect
    },
    accent: {
      backgroundColor: "rgba(18, 219, 192, 0.15)",
      borderWidth: 1,
      borderColor: "rgba(18, 219, 192, 0.3)",
      // No shadows to eliminate dark center effect
    },
    subtle: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.12)",
      // No shadows to eliminate dark center effect
    },
  };

  return variants[variant];
};

interface Step1MapSelectionProps {
  initialCoordinates?: {
    latitude: number;
    longitude: number;
  };
  onCoordinatesSelected: (coordinates: {
    latitude: number;
    longitude: number;
  }) => void;
}

const DEFAULT_REGION: Region = {
  latitude: 37.9755, // Athens, Greece
  longitude: 23.7348,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function Step1MapSelection({
  initialCoordinates,
  onCoordinatesSelected,
}: Step1MapSelectionProps) {
  const [selectedCoordinates, setSelectedCoordinates] =
    useState(initialCoordinates);
  const [mapRegion, setMapRegion] = useState<Region>(
    initialCoordinates
      ? {
          ...initialCoordinates,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : DEFAULT_REGION
  );
  const [mapType, setMapType] = useState<MapTypeEnum>(MapTypeEnum.HYBRID);

  const mapRef = useRef<MapView>(null);
  const { coords, refetch } = useCurrentLocation();

  // Use reverse geocoding to get location name
  const locationName = useReverseGeocode(
    selectedCoordinates?.latitude,
    selectedCoordinates?.longitude
  );

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newCoordinates = { latitude, longitude };

    setSelectedCoordinates(newCoordinates);
    onCoordinatesSelected(newCoordinates);
  };

  const handleCurrentLocationPress = async () => {
    try {
      await refetch();
      if (coords) {
        const currentLocation = { latitude: coords.lat, longitude: coords.lon };
        const newRegion = {
          ...currentLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setMapRegion(newRegion);
        setSelectedCoordinates(currentLocation);
        onCoordinatesSelected(currentLocation);

        mapRef.current?.animateToRegion(newRegion, 1000);
      } else {
        Alert.alert(
          "Location Not Available",
          "Unable to get your current location. Please select a spot on the map manually.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Location Error",
        "There was an error getting your location. Please select a spot on the map manually.",
        [{ text: "OK" }]
      );
    }
  };

  const handleConfirmLocation = () => {
    if (selectedCoordinates) {
      Alert.alert(
        "Location Selected",
        `Latitude: ${selectedCoordinates.latitude.toFixed(
          6
        )}\nLongitude: ${selectedCoordinates.longitude.toFixed(6)}`,
        [{ text: "OK" }]
      );
    }
  };

  const toggleMapType = () => {
    const mapTypes = [
      MapTypeEnum.STANDARD,
      MapTypeEnum.SATELLITE,
      MapTypeEnum.HYBRID,
      MapTypeEnum.TERRAIN,
    ];
    const currentIndex = mapTypes.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % mapTypes.length;
    setMapType(mapTypes[nextIndex]);
  };

  return (
    <View style={styles.container}>
      {/* Map Container */}
      <View style={[styles.mapContainer, getUltraGlassStyle("premium")]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          mapType={mapType}
        >
          {selectedCoordinates && (
            <Marker
              coordinate={selectedCoordinates}
              title="Selected Fishing Spot"
              description="Your chosen location for the fishing adventure"
            />
          )}
        </MapView>

        {/* Floating Location Button */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            onPress={handleCurrentLocationPress}
            style={[styles.locationButton, getUltraGlassStyle("default")]}
            activeOpacity={0.8}
          >
            <Navigation size={22} color={colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Map Type Toggle Button */}
        <View style={styles.mapTypeControls}>
          <TouchableOpacity
            onPress={toggleMapType}
            style={[styles.mapTypeButton, getUltraGlassStyle("default")]}
            activeOpacity={0.8}
          >
            <Layers size={20} color={colors.accent} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Selection Indicator with Glass Effect */}
        {selectedCoordinates && (
          <View
            style={[styles.selectionIndicator, getUltraGlassStyle("accent")]}
          >
            <View style={styles.checkIconContainer}>
              <Check size={18} color={colors.white} strokeWidth={3} />
            </View>
            <Text style={styles.selectionText}>Location Selected</Text>
          </View>
        )}
      </View>

      {/* Location Display with Premium Glass */}
      {selectedCoordinates && locationName && (
        <View
          style={[styles.coordinatesContainer, getUltraGlassStyle("accent")]}
        >
          <View style={styles.locationIconWrapper}>
            <MapPin size={20} color={colors.accent} strokeWidth={2.5} />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.coordinatesTitle}>SELECTED LOCATION</Text>
            <Text style={styles.coordinatesText}>{locationName}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },

  // Compact Map Container - Adjusted to fit with footer and coordinates container
  mapContainer: {
    flex: 1,
    minHeight: height * 0.5,
    maxHeight: height * 0.55,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: "absolute",
    top: 20,
    right: 20,
    gap: 12,
  },
  mapTypeControls: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    gap: 12,
  },
  mapTypeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginTop: 68, // Position below location button
  },
  locationButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  // Selection Indicator
  selectionIndicator: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 10,
  },
  checkIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  selectionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Compact Coordinates Display
  coordinatesContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    gap: 12,
    marginTop: 0,
    marginBottom: 0,
  },
  locationIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(18, 219, 192, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(18, 219, 192, 0.4)",
    shadowColor: "#12dbc0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  locationTextContainer: {
    flex: 1,
  },
  coordinatesTitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  coordinatesText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
});
