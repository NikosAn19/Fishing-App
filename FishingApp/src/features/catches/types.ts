export type PhotoRef = {
  key: string;
  url?: string;
  contentType?: string;
  size?: number;
};

export type SpotRef = {
  name?: string;
  lat?: number;
  lon?: number;
};

export type CatchItem = {
  id: string;
  species: string;
  weight?: number | null;
  length?: number | null;
  notes?: string;
  photo?: PhotoRef;
  spot?: SpotRef;
  capturedAt?: string | null;
  createdAt?: string;
};

export type FishRecognitionResult = {
  species: string;
  confidence: number;
  commonName?: string;
  scientificName?: string;
  description?: string;
};
