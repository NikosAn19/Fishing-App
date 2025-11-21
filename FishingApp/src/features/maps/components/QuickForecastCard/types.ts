import { FavoriteSpot } from "../../types/maps";

export interface QuickForecastCardProps {
  coordinates: { lat: number; lon: number };
  onViewFull: () => void;
  onSaveFavorite?: (
    name: string,
    coordinates: { lat: number; lon: number }
  ) => void;
  onClose: () => void;
  favoriteSpot?: FavoriteSpot;
  onDelete?: (id: string) => void;
}
