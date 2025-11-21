export interface SelectButtonProps {
  onPress: (coordinates: { lat: number; lon: number }) => void;
  disabled?: boolean;
}
