/**
 * Base attachment interface
 */
interface BaseAttachment {
  id: string;  // Unique ID for this attachment
  mimeType: string;
  size: number;  // File size in bytes
}

/**
 * Image attachment
 */
export interface ImageAttachment extends BaseAttachment {
  type: 'image';
  url: string;
  width: number;
  height: number;
  thumbnail?: string;  // Thumbnail URL for lazy loading
}

/**
 * Video attachment
 */
export interface VideoAttachment extends BaseAttachment {
  type: 'video';
  url: string;
  duration: number;  // Duration in seconds
  width: number;
  height: number;
  thumbnail?: string;  // Video thumbnail
}

/**
 * Audio attachment (voice messages, audio files)
 */
export interface AudioAttachment extends BaseAttachment {
  type: 'audio';
  url: string;
  duration: number;  // Duration in seconds
  waveform?: number[];  // Waveform data for visualization
}

/**
 * File attachment (PDFs, documents, etc.)
 */
export interface FileAttachment extends BaseAttachment {
  type: 'file';
  url: string;
  filename: string;
}

/**
 * Union type for all attachment types
 */
export type MessageAttachment = 
  | ImageAttachment 
  | VideoAttachment 
  | AudioAttachment 
  | FileAttachment;
