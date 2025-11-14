// Maps Image Service for getting location images from Google Maps API
import { LocationInfo } from "../../location/types/location";

export interface MapsImageOptions {
  width?: number;
  height?: number;
  zoom?: number;
  mapType?: "roadmap" | "satellite" | "hybrid" | "terrain";
  heading?: number; // For Street View (0-360 degrees)
  pitch?: number; // For Street View (-90 to 90 degrees)
  fov?: number; // Field of view for Street View (10-120 degrees)
}

export class MapsImageService {
  private static API_KEY = "AIzaSyClf7gIKtjMPDzqU951NDCvoFlSlia3iYY"; // From app.config.js

  // Get Static Map Image URL
  static getStaticMapUrl(
    location: LocationInfo | { latitude: number; longitude: number },
    options: MapsImageOptions = {}
  ): string {
    const { latitude, longitude } = location;
    const {
      width = 600,
      height = 300,
      zoom = 15,
      mapType = "satellite",
    } = options;

    return (
      `https://maps.googleapis.com/maps/api/staticmap?` +
      `center=${latitude},${longitude}` +
      `&zoom=${zoom}` +
      `&size=${width}x${height}` +
      `&maptype=${mapType}` +
      `&markers=color:red%7C${latitude},${longitude}` +
      `&key=${this.API_KEY}`
    );
  }

  // Get Street View Image URL
  static getStreetViewUrl(
    location: LocationInfo | { latitude: number; longitude: number },
    options: MapsImageOptions = {}
  ): string {
    const { latitude, longitude } = location;
    const {
      width = 600,
      height = 300,
      heading = 0,
      pitch = 0,
      fov = 90,
    } = options;

    return (
      `https://maps.googleapis.com/maps/api/streetview?` +
      `size=${width}x${height}` +
      `&location=${latitude},${longitude}` +
      `&heading=${heading}` +
      `&pitch=${pitch}` +
      `&fov=${fov}` +
      `&key=${this.API_KEY}`
    );
  }

  // Get multiple image types for a location
  static getLocationImages(
    location: LocationInfo | { latitude: number; longitude: number },
    options: MapsImageOptions = {}
  ) {
    const { latitude, longitude } = location;

    return {
      satellite: this.getStaticMapUrl(location, {
        ...options,
        mapType: "satellite",
      }),
      hybrid: this.getStaticMapUrl(location, { ...options, mapType: "hybrid" }),
      terrain: this.getStaticMapUrl(location, {
        ...options,
        mapType: "terrain",
      }),
      roadmap: this.getStaticMapUrl(location, {
        ...options,
        mapType: "roadmap",
      }),
      streetView: this.getStreetViewUrl(location, options),
      // Street View with different angles
      streetViewNorth: this.getStreetViewUrl(location, {
        ...options,
        heading: 0,
      }),
      streetViewEast: this.getStreetViewUrl(location, {
        ...options,
        heading: 90,
      }),
      streetViewSouth: this.getStreetViewUrl(location, {
        ...options,
        heading: 180,
      }),
      streetViewWest: this.getStreetViewUrl(location, {
        ...options,
        heading: 270,
      }),
    };
  }

  // Check if Street View is available for a location
  static async checkStreetViewAvailability(
    location: LocationInfo | { latitude: number; longitude: number }
  ): Promise<boolean> {
    try {
      const { latitude, longitude } = location;
      const url =
        `https://maps.googleapis.com/maps/api/streetview/metadata?` +
        `location=${latitude},${longitude}` +
        `&key=${this.API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      return data.status === "OK";
    } catch (error) {
      console.error("Error checking Street View availability:", error);
      return false;
    }
  }

  // Get thumbnail image for quick preview
  static getThumbnailUrl(
    location: LocationInfo | { latitude: number; longitude: number },
    mapType: "satellite" | "hybrid" | "terrain" | "roadmap" = "satellite"
  ): string {
    return this.getStaticMapUrl(location, {
      width: 200,
      height: 150,
      zoom: 16,
      mapType,
    });
  }

  // Get high-resolution image for detailed view
  static getHighResUrl(
    location: LocationInfo | { latitude: number; longitude: number },
    mapType: "satellite" | "hybrid" | "terrain" | "roadmap" = "satellite"
  ): string {
    return this.getStaticMapUrl(location, {
      width: 1200,
      height: 800,
      zoom: 18,
      mapType,
    });
  }
}

// Helper function to get image for fishing spot
export const getFishingSpotImages = (
  spot: { coordinates: { latitude: number; longitude: number } },
  options: MapsImageOptions = {}
) => {
  return MapsImageService.getLocationImages(spot.coordinates, options);
};

// Helper function to get image for catch location
export const getCatchLocationImages = (
  catchData: { coordinates: { latitude: number; longitude: number } },
  options: MapsImageOptions = {}
) => {
  return MapsImageService.getLocationImages(catchData.coordinates, options);
};
