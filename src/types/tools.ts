export type ToolCategory = 
  | 'organize' 
  | 'optimize' 
  | 'convert-to-pdf' 
  | 'convert-from-pdf' 
  | 'edit';

export interface PDFTool {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  badge?: string;
  isPopular?: boolean;
  isFunctional: boolean;
  iconName: string;
  acceptedFormats?: string;
  features: string[];
}

export interface ImageFileItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
}

export type PageSizeOption = 'fit' | 'a4' | 'letter' | 'legal';
export type OrientationOption = 'auto' | 'portrait' | 'landscape';
export type MarginOption = 'none' | 'small' | 'medium' | 'large';
export type ImageFitOption = 'fit' | 'fill';
export type QualityOption = 'high' | 'medium' | 'low';

export type TargetSizeOption = 
  | 'original'
  | '100kb'
  | '200kb'
  | '500kb'
  | '1mb'
  | '2mb'
  | '5mb'
  | '10mb'
  | 'custom';

export type TargetUnit = 'KB' | 'MB';

export interface ConverterSettings {
  pageSize: PageSizeOption;
  orientation: OrientationOption;
  margin: MarginOption;
  imageFit: ImageFitOption;
  quality: QualityOption;
  fileName: string;
  mergeAll: boolean;
  targetSize: TargetSizeOption;
  customTargetValue: number;
  customTargetUnit: TargetUnit;
}

export interface PdfGenerationResult {
  pdfBlob: Blob;
  totalSize: number;
  pageCount: number;
  targetSizeBytes: number | null;
  achievedWithinTarget: boolean;
  attempts: number;
  originalTotalSize: number;
}
