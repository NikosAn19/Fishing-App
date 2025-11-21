export interface AdventureScheduleData {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  selectedDate?: string;
  fishingDetails?: {
    technique?: string;
    lures?: string[];
    notes?: string;
  };
}

export interface AdventureScheduleWizardProps {
  onClose: () => void;
  onAdventureSaved?: () => void;
}
