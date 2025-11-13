// UI-related types
export interface MapViewProps {
  onMapPress?: (event: any) => void;
  onMarkerPress?: (marker: any) => void;
}

export enum MapTypeEnum {
  STANDARD = "standard",
  SATELLITE = "satellite",
  HYBRID = "hybrid",
  TERRAIN = "terrain",
}
