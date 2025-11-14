import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  MapsImageService,
  MapsImageOptions,
} from "../services/mapsImageService";
import { LocationInfo } from "../../location/types/location";

interface LocationImageViewProps {
  location: LocationInfo | { latitude: number; longitude: number };
  size?: "small" | "medium" | "large";
  mapType?: "satellite" | "hybrid" | "terrain" | "roadmap";
  showStreetView?: boolean;
  showMultipleViews?: boolean;
  onImagePress?: (imageUrl: string, mapType: string) => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get("window");

export default function LocationImageView({
  location,
  size = "medium",
  mapType = "satellite",
  showStreetView = false,
  showMultipleViews = false,
  onImagePress,
  style,
}: LocationImageViewProps) {
  const [images, setImages] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streetViewAvailable, setStreetViewAvailable] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { width: 200, height: 150, zoom: 16 },
    medium: { width: 400, height: 300, zoom: 15 },
    large: { width: screenWidth - 40, height: 400, zoom: 14 },
  };

  const currentSize = sizeConfig[size];

  useEffect(() => {
    loadImages();
  }, [location, mapType, showStreetView]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const options: MapsImageOptions = {
        width: currentSize.width,
        height: currentSize.height,
        zoom: currentSize.zoom,
        mapType,
      };

      if (showMultipleViews) {
        // Load all image types
        const allImages = MapsImageService.getLocationImages(location, options);
        setImages(allImages);

        // Check Street View availability
        if (showStreetView) {
          const hasStreetView =
            await MapsImageService.checkStreetViewAvailability(location);
          setStreetViewAvailable(hasStreetView);
        }
      } else {
        // Load single image
        const imageUrl = MapsImageService.getStaticMapUrl(location, options);
        setImages({ [mapType]: imageUrl });
      }
    } catch (err) {
      setError("Failed to load location images");
      console.error("Error loading location images:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePress = (imageUrl: string, type: string) => {
    if (onImagePress) {
      onImagePress(imageUrl, type);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { width: currentSize.width, height: currentSize.height },
          style,
        ]}
      >
        <ActivityIndicator size="large" color="#12dbc0" />
        <Text style={styles.loadingText}>Loading location image...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          { width: currentSize.width, height: currentSize.height },
          style,
        ]}
      >
        <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadImages}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!showMultipleViews && images) {
    const imageUrl = images[mapType];
    return (
      <TouchableOpacity
        style={[
          styles.singleImageContainer,
          { width: currentSize.width, height: currentSize.height },
          style,
        ]}
        onPress={() => handleImagePress(imageUrl, mapType)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: imageUrl }} style={styles.singleImage} />
        <View style={styles.imageOverlay}>
          <Text style={styles.imageTypeText}>{mapType.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (showMultipleViews && images) {
    const imageTypes = Object.keys(images).filter((key) =>
      showStreetView ? true : !key.startsWith("streetView")
    );

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.scrollContainer, style]}
        contentContainerStyle={styles.scrollContent}
      >
        {imageTypes.map((type) => {
          const imageUrl = images[type];
          const isStreetView = type.startsWith("streetView");

          // Skip Street View if not available
          if (isStreetView && !streetViewAvailable) return null;

          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.multipleImageContainer,
                { width: currentSize.width, height: currentSize.height },
              ]}
              onPress={() => handleImagePress(imageUrl, type)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: imageUrl }} style={styles.multipleImage} />
              <View style={styles.imageOverlay}>
                <Text style={styles.imageTypeText}>
                  {type.replace(/([A-Z])/g, " $1").toUpperCase()}
                </Text>
                {isStreetView && (
                  <Ionicons
                    name="eye"
                    size={16}
                    color="#fff"
                    style={styles.streetViewIcon}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#ff6b6b",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#12dbc0",
    borderRadius: 4,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  singleImageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  singleImage: {
    width: "100%",
    height: "100%",
  },
  multipleImageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    marginRight: 12,
  },
  multipleImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  imageTypeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  streetViewIcon: {
    marginLeft: 4,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
});
