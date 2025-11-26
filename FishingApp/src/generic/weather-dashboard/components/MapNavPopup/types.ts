export interface MapNavPopupProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
}
