// Map-related types
import { LocationInfo } from "../../location/types/location";

import { Region } from "react-native-maps";

export interface MapViewProps {
  onMapPress?: (event: any) => void;
  onMarkerPress?: (marker: any) => void;
  onRegionChangeComplete?: (region: Region) => void;
  favoriteSpots?: FavoriteSpot[];
  initialRegion?: Region; // Optional initial region to focus on
}

export enum MapTypeEnum {
  STANDARD = "standard",
  SATELLITE = "satellite",
  HYBRID = "hybrid",
  TERRAIN = "terrain",
}

export type MapMode = "normal" | "select" | "view-favorite";

export interface FavoriteSpot extends LocationInfo {
  id: string;
  name: string; // User-given name
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
