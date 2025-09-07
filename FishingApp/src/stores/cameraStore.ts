import { create } from "zustand";

export interface CapturedPhoto {
  id: string;
  uri: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  fishIdentification?: {
    species: string;
    confidence: number;
    details?: any;
  };
  notes?: string;
}

interface CameraState {
  // Camera state
  isCameraOpen: boolean;
  currentPhoto: CapturedPhoto | null;

  // Photo management
  capturedPhotos: CapturedPhoto[];
  selectedPhoto: CapturedPhoto | null;

  // Fish identification
  isIdentifying: boolean;
  identificationResults: any[];

  // Actions
  openCamera: () => void;
  closeCamera: () => void;
  capturePhoto: (
    uri: string,
    location?: { latitude: number; longitude: number }
  ) => void;
  setSelectedPhoto: (photo: CapturedPhoto | null) => void;
  addPhotoNotes: (photoId: string, notes: string) => void;
  deletePhoto: (photoId: string) => void;
  startFishIdentification: (photoUri: string) => void;
  setIdentificationResults: (results: any[]) => void;
  clearPhotos: () => void;
}

export const useCameraStore = create<CameraState>((set, get) => ({
  // Initial state
  isCameraOpen: false,
  currentPhoto: null,
  capturedPhotos: [],
  selectedPhoto: null,
  isIdentifying: false,
  identificationResults: [],

  // Actions
  openCamera: () => set({ isCameraOpen: true }),

  closeCamera: () => set({ isCameraOpen: false, currentPhoto: null }),

  capturePhoto: (
    uri: string,
    location?: { latitude: number; longitude: number }
  ) => {
    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      uri,
      timestamp: new Date(),
      location,
    };

    set((state) => ({
      currentPhoto: newPhoto,
      capturedPhotos: [newPhoto, ...state.capturedPhotos],
    }));
  },

  setSelectedPhoto: (photo: CapturedPhoto | null) => {
    set({ selectedPhoto: photo });
  },

  addPhotoNotes: (photoId: string, notes: string) => {
    set((state) => ({
      capturedPhotos: state.capturedPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, notes } : photo
      ),
      selectedPhoto:
        state.selectedPhoto?.id === photoId
          ? { ...state.selectedPhoto, notes }
          : state.selectedPhoto,
    }));
  },

  deletePhoto: (photoId: string) => {
    set((state) => ({
      capturedPhotos: state.capturedPhotos.filter(
        (photo) => photo.id !== photoId
      ),
      selectedPhoto:
        state.selectedPhoto?.id === photoId ? null : state.selectedPhoto,
    }));
  },

  startFishIdentification: (photoUri: string) => {
    set({ isIdentifying: true });

    // TODO: Implement actual fish identification API call
    // For now, simulate the process
    setTimeout(() => {
      const mockResults = [
        {
          species: "Sea Bass",
          confidence: 0.85,
          details: {
            family: "Moronidae",
            habitat: "Coastal waters",
            averageSize: "30-50 cm",
          },
        },
        {
          species: "Sea Bream",
          confidence: 0.72,
          details: {
            family: "Sparidae",
            habitat: "Rocky bottoms",
            averageSize: "25-40 cm",
          },
        },
      ];

      set({
        isIdentifying: false,
        identificationResults: mockResults,
      });
    }, 2000);
  },

  setIdentificationResults: (results: any[]) => {
    set({ identificationResults: results });
  },

  clearPhotos: () => {
    set({
      capturedPhotos: [],
      selectedPhoto: null,
      currentPhoto: null,
      identificationResults: [],
    });
  },
}));
