import * as Location from "expo-location";
import { LocationInfo } from "../../../types";

export class LocationService {
  // Request location permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  // Check if location permissions are granted
  static async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error checking location permissions:", error);
      return false;
    }
  }

  // Get current location
  static async getCurrentLocation(): Promise<LocationInfo | null> {
    try {
      // Check permissions first
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          console.log("Location permission denied");
          return null;
        }
      }

      // Get current position with fallback accuracy
      let location;
      try {
        // Try high accuracy first with timeout
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      } catch (highAccuracyError) {
        console.log(
          "High accuracy failed, trying balanced:",
          highAccuracyError
        );
        // Fallback to balanced accuracy
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      // Get address from coordinates
      let address = "";
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          address = [place.street, place.city, place.region, place.country]
            .filter(Boolean)
            .join(", ");
        }
      } catch (geocodeError) {
        console.log("Error getting address:", geocodeError);
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        address,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  }

  // Get last known location (faster, but might be outdated)
  static async getLastKnownLocation(): Promise<LocationInfo | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getLastKnownPositionAsync({});
      if (!location) {
        return null;
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error("Error getting last known location:", error);
      return null;
    }
  }
}
