import { PDFDocument } from 'pdf-lib';
import type { 
  ImageFileItem, 
  ConverterSettings, 
  PageSizeOption, 
  OrientationOption, 
  MarginOption,
  TargetSizeOption,
  PdfGenerationResult
} from '../types/tools';

// Standard 72 DPI PDF dimensions (in points)
const PAGE_DIMENSIONS: Record<Exclude<PageSizeOption, 'fit'>, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
};

const MARGIN_SIZES: Record<MarginOption, number> = {
  none: 0,
  small: 20,
  medium: 40,
  large: 60,
};

export interface TargetSizePresetItem {
  id: TargetSizeOption;
  label: string;
  bytes?: number;
  description?: string;
}

export const TARGET_SIZE_PRESETS: TargetSizePresetItem[] = [
  { id: 'original', label: 'Original Quality', description: 'Uncapped standard quality' },
  { id: '100kb', label: '100 KB', bytes: 100 * 1024, description: 'Email attachments & strict portals' },
  { id: '200kb', label: '200 KB', bytes: 200 * 1024, description: 'Online job & govt forms' },
  { id: '500kb', label: '500 KB', bytes: 500 * 1024, description: 'Standard balanced size' },
  { id: '1mb', label: '1 MB', bytes: 1 * 1024 * 1024, description: 'Crisp multi-page documents' },
  { id: '2mb', label: '2 MB', bytes: 2 * 1024 * 1024, description: 'High detail portfolios' },
  { id: '5mb', label: '5 MB', bytes: 5 * 1024 * 1024, description: 'Very high resolution photos' },
  { id: '10mb', label: '10 MB', bytes: 10 * 1024 * 1024, description: 'Near lossless archive' },
  { id: 'custom', label: 'Custom Size', description: 'Enter specific KB or MB' },
];

/**
 * Resolves the numeric target size in bytes from user settings.
 * Returns null if user selected 'original'.
 */
export function getTargetBytes(settings: ConverterSettings): number | null {
  if (settings.targetSize === 'original') return null;
  if (settings.targetSize === 'custom') {
    const val = Math.max(10, Number(settings.customTargetValue) || 500);
    const multiplier = settings.customTargetUnit === 'MB' ? 1024 * 1024 : 1024;
    return Math.round(val * multiplier);
  }
  const preset = TARGET_SIZE_PRESETS.find(p => p.id === settings.targetSize);
  return preset?.bytes || null;
}

/**
 * Estimates the final PDF size and provides user guidance
 */
export function calculateEstimatedPdfSize(
  items: ImageFileItem[],
  settings: ConverterSettings
): {
  estimatedBytes: number;
  formatted: string;
  isAggressive: boolean;
  warning?: string;
} {
  const count = items.length;
  if (count === 0) {
    return { estimatedBytes: 0, formatted: '0 KB', isAggressive: false };
  }

  const totalRawBytes = items.reduce((acc, curr) => acc + curr.size, 0);
  const pdfStructureOverhead = 2500 + count * 1400; // Catalog, xref, fonts, page dicts
  const targetBytes = getTargetBytes(settings);

  if (targetBytes === null) {
    // Uncapped / standard quality estimation
    const qualityRatio = settings.quality === 'high' ? 0.85 : settings.quality === 'medium' ? 0.50 : 0.28;
    const est = Math.round(totalRawBytes * qualityRatio + pdfStructureOverhead);
    return {
      estimatedBytes: est,
      formatted: `~${formatBytes(est)}`,
      isAggressive: false,
    };
  }

  // With user target size
  const minRealisticPerImage = 10 * 1024; // 10 KB per image floor for reasonable readability
  const minRealisticTotal = pdfStructureOverhead + count * minRealisticPerImage;

  if (targetBytes < minRealisticTotal && count > 1) {
    return {
      estimatedBytes: minRealisticTotal,
      formatted: `~${formatBytes(minRealisticTotal)} (Best effort)`,
      isAggressive: true,
      warning: `Target (${formatBytes(targetBytes)}) is very tight for ${count} pages. Maximum compression will be applied while preserving legibility.`,
    };
  }

  const est = Math.min(targetBytes, Math.round(targetBytes * 0.95));
  return {
    estimatedBytes: est,
    formatted: `~${formatBytes(est)}`,
    isAggressive: false,
  };
}

/**
 * Loads an image file or object URL into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for processing: ' + err));
    img.src = src;
  });
}

interface RenderJpgOptions {
  quality: number;
  maxDimension?: number;
}

/**
 * Renders an image to an off-screen canvas with rotation, optional resolution downscaling,
 * and JPEG compression. Transparent backgrounds are rendered on clean white.
 */
async function renderImageToJpgBytes(
  img: HTMLImageElement,
  rotation: number,
  options: RenderJpgOptions
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const rot = (rotation || 0) % 360;
  const isRotated90or270 = rot === 90 || rot === 270;

  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  let targetW = origW;
  let targetH = origH;

  // Progressive resolution downscaling if maxDimension is specified
  if (options.maxDimension && options.maxDimension > 0) {
    const maxDim = options.maxDimension;
    if (targetW > maxDim || targetH > maxDim) {
      const scale = Math.min(maxDim / targetW, maxDim / targetH);
      targetW = Math.max(100, Math.round(targetW * scale));
      targetH = Math.max(100, Math.round(targetH * scale));
    }
  }

  canvas.width = isRotated90or270 ? targetH : targetW;
  canvas.height = isRotated90or270 ? targetW : targetH;

  ctx.save();
  // Handle 90/180/270 degree rotations
  if (rot === 90) {
    ctx.translate(canvas.width, 0);
    ctx.rotate((90 * Math.PI) / 180);
  } else if (rot === 180) {
    ctx.translate(canvas.width, canvas.height);
    ctx.rotate((180 * Math.PI) / 180);
  } else if (rot === 270) {
    ctx.translate(0, canvas.height);
    ctx.rotate((270 * Math.PI) / 180);
  }

  // Draw background white in case of transparent PNG/WebP/SVG converted to JPEG
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);
  ctx.restore();

  // Clamp quality between 0.20 and 1.0
  const clampedQuality = Math.max(0.20, Math.min(1.0, options.quality));

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, 'image/jpeg', clampedQuality)
  );

  if (!blob) throw new Error('Failed to export image from canvas');

  const arrayBuffer = await blob.arrayBuffer();
  return {
    bytes: new Uint8Array(arrayBuffer),
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Optimizes an image to fit within an allocated byte budget by progressively
 * tuning resolution and JPEG quality while preserving readable visual fidelity.
 */
async function optimizeImageForBudget(
  img: HTMLImageElement,
  rotation: number,
  budgetBytes: number,
  isRetryPass = false
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;
  const maxOrigDim = Math.max(origW, origH);

  // Progressive resolution & quality tiers mapped to byte budget
  let initialMaxDim: number;
  let initialQuality: number;

  if (budgetBytes >= 2_500_000) {
    initialMaxDim = Math.min(maxOrigDim, 3200);
    initialQuality = 0.92;
  } else if (budgetBytes >= 1_200_000) {
    initialMaxDim = Math.min(maxOrigDim, 2560);
    initialQuality = 0.88;
  } else if (budgetBytes >= 600_000) {
    initialMaxDim = Math.min(maxOrigDim, 2048);
    initialQuality = 0.82;
  } else if (budgetBytes >= 300_000) {
    initialMaxDim = Math.min(maxOrigDim, 1600);
    initialQuality = 0.76;
  } else if (budgetBytes >= 150_000) {
    initialMaxDim = Math.min(maxOrigDim, 1280);
    initialQuality = 0.70;
  } else if (budgetBytes >= 80_000) {
    initialMaxDim = Math.min(maxOrigDim, 1024);
    initialQuality = 0.62;
  } else if (budgetBytes >= 40_000) {
    initialMaxDim = Math.min(maxOrigDim, 800);
    initialQuality = 0.52;
  } else if (budgetBytes >= 20_000) {
    initialMaxDim = Math.min(maxOrigDim, 640);
    initialQuality = 0.42;
  } else {
    // Very tight budget
    initialMaxDim = Math.min(maxOrigDim, 480);
    initialQuality = 0.35;
  }

  if (isRetryPass) {
    // Tighten parameters on retry
    initialMaxDim = Math.max(360, Math.round(initialMaxDim * 0.82));
    initialQuality = Math.max(0.28, initialQuality * 0.85);
  }

  let result = await renderImageToJpgBytes(img, rotation, {
    maxDimension: initialMaxDim,
    quality: initialQuality,
  });

  // If actual size exceeds budget by > 5%, perform one immediate fast refinement
  if (result.bytes.length > budgetBytes * 1.05) {
    const overshootRatio = result.bytes.length / budgetBytes;
    // Dimension scales area quadratically
    const scaleMultiplier = Math.min(0.92, Math.max(0.45, Math.sqrt(1 / overshootRatio) * 1.04));
    const refinedMaxDim = Math.max(360, Math.round(initialMaxDim * scaleMultiplier));
    const refinedQuality = Math.max(0.28, Math.min(initialQuality * 0.9, initialQuality / Math.sqrt(overshootRatio)));

    const refined = await renderImageToJpgBytes(img, rotation, {
      maxDimension: refinedMaxDim,
      quality: refinedQuality,
    });

    if (refined.bytes.length < result.bytes.length) {
      result = refined;
    }
  }

  return result;
}

/**
 * Builds a single PDF pass with the given list of loaded images and budgets.
 */
async function buildPdfPass(
  loadedImages: { item: ImageFileItem; img: HTMLImageElement }[],
  settings: ConverterSettings,
  imageBudgets: number[] | null,
  isRetryPass: boolean,
  onProgress?: (progress: number, statusText: string) => void,
  progressBase = 10,
  progressSpan = 75
): Promise<{ pdfBytes: Uint8Array; totalSize: number }> {
  const pdfDoc = await PDFDocument.create();
  const marginPoints = MARGIN_SIZES[settings.margin] || 0;
  const total = loadedImages.length;

  for (let i = 0; i < total; i++) {
    const { item, img } = loadedImages[i];
    const itemProgress = Math.round(progressBase + (i / total) * progressSpan);

    if (imageBudgets) {
      const budgetForThis = imageBudgets[i];
      onProgress?.(
        itemProgress,
        isRetryPass
          ? `Refining page ${i + 1} of ${total} (Target: ~${formatBytes(budgetForThis)})...`
          : `Optimizing page ${i + 1} of ${total} (Target: ~${formatBytes(budgetForThis)})...`
      );
    } else {
      onProgress?.(itemProgress, `Processing page ${i + 1} of ${total}: ${item.name}`);
    }

    // Process image to JPG bytes
    let imageResult: { bytes: Uint8Array; width: number; height: number };

    if (imageBudgets) {
      imageResult = await optimizeImageForBudget(img, item.rotation, imageBudgets[i], isRetryPass);
    } else {
      // Uncapped standard quality mode
      const qualityValue = settings.quality === 'high' ? 0.95 : settings.quality === 'medium' ? 0.8 : 0.6;
      const maxDim = settings.quality === 'high' ? 3600 : settings.quality === 'medium' ? 2400 : 1600;
      imageResult = await renderImageToJpgBytes(img, item.rotation, {
        quality: qualityValue,
        maxDimension: maxDim,
      });
    }

    const embeddedImg = await pdfDoc.embedJpg(imageResult.bytes);
    const imgW = imageResult.width;
    const imgH = imageResult.height;

    // Calculate Page Dimensions
    let pageWidth: number;
    let pageHeight: number;

    if (settings.pageSize === 'fit') {
      const maxDim = 2000;
      let w = imgW;
      let h = imgH;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = w * ratio;
        h = h * ratio;
      }
      pageWidth = w + marginPoints * 2;
      pageHeight = h + marginPoints * 2;
    } else {
      const preset = PAGE_DIMENSIONS[settings.pageSize] || PAGE_DIMENSIONS.a4;
      let isLandscape = false;

      if (settings.orientation === 'portrait') {
        isLandscape = false;
      } else if (settings.orientation === 'landscape') {
        isLandscape = true;
      } else {
        // Auto: matches image aspect ratio
        isLandscape = imgW > imgH;
      }

      pageWidth = isLandscape ? Math.max(preset.width, preset.height) : Math.min(preset.width, preset.height);
      pageHeight = isLandscape ? Math.min(preset.width, preset.height) : Math.max(preset.width, preset.height);
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Available drawable area within margins
    const drawAreaWidth = Math.max(10, pageWidth - marginPoints * 2);
    const drawAreaHeight = Math.max(10, pageHeight - marginPoints * 2);

    let renderW = drawAreaWidth;
    let renderH = drawAreaHeight;
    let posX = marginPoints;
    let posY = marginPoints;

    if (settings.imageFit === 'fit') {
      // Contain: preserve aspect ratio, fit inside draw area
      const scaleFactor = Math.min(drawAreaWidth / imgW, drawAreaHeight / imgH);
      renderW = imgW * scaleFactor;
      renderH = imgH * scaleFactor;
      posX = marginPoints + (drawAreaWidth - renderW) / 2;
      posY = marginPoints + (drawAreaHeight - renderH) / 2;
    } else {
      // Fill: stretch to draw area
      renderW = drawAreaWidth;
      renderH = drawAreaHeight;
      posX = marginPoints;
      posY = marginPoints;
    }

    page.drawImage(embeddedImg, {
      x: posX,
      y: posY,
      width: renderW,
      height: renderH,
    });
  }

  onProgress?.(progressBase + progressSpan + 5, 'Finalizing PDF document...');
  const pdfBytes = await pdfDoc.save();
  return { pdfBytes, totalSize: pdfBytes.length };
}

/**
 * Generates a PDF from a list of image items and user settings entirely client-side.
 * Includes progressive target size optimization, intelligent resolution downscaling,
 * and automatic multi-pass compression retry if the target size is exceeded.
 */
export async function generatePdfFromImages(
  items: ImageFileItem[],
  settings: ConverterSettings,
  onProgress?: (progress: number, statusText: string) => void
): Promise<PdfGenerationResult> {
  if (items.length === 0) {
    throw new Error('Please select at least one image to convert.');
  }

  const totalInputBytes = items.reduce((acc, curr) => acc + curr.size, 0);
  const totalCount = items.length;
  const targetBytes = getTargetBytes(settings);

  onProgress?.(5, 'Pre-loading images into engine...');
  const loadedImages = await Promise.all(
    items.map(async (item) => {
      const img = await loadImage(item.previewUrl);
      return { item, img };
    })
  );

  // Case 1: Uncapped / Standard Quality (No Target Size)
  if (targetBytes === null) {
    const { pdfBytes, totalSize } = await buildPdfPass(
      loadedImages,
      settings,
      null,
      false,
      onProgress,
      10,
      80
    );

    onProgress?.(100, 'Done!');
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    return {
      pdfBlob,
      totalSize,
      pageCount: totalCount,
      targetSizeBytes: null,
      achievedWithinTarget: true,
      attempts: 1,
      originalTotalSize: totalInputBytes,
    };
  }

  // Case 2: Target PDF Size requested
  onProgress?.(10, `Calculating image compression budget for ${formatBytes(targetBytes)}...`);

  // PDF structural overhead: document catalogs, page dictionaries, procsets, fonts, xref table
  const pdfOverheadEstimate = Math.round(2500 + 1300 * totalCount);
  const availableImageBudget = Math.max(totalCount * 6000, targetBytes - pdfOverheadEstimate);

  // Distribute image budget with blended weighted + equal distribution
  const computeBudgets = (totalBudget: number): number[] => {
    return loadedImages.map(({ item }) => {
      const rawWeight = totalInputBytes > 0 ? item.size / totalInputBytes : 1 / totalCount;
      const blendedWeight = 0.65 * rawWeight + 0.35 * (1 / totalCount);
      return Math.max(4096, Math.round(totalBudget * blendedWeight));
    });
  };

  let imageBudgets = computeBudgets(availableImageBudget);

  // First Pass
  let passResult = await buildPdfPass(
    loadedImages,
    settings,
    imageBudgets,
    false,
    onProgress,
    12,
    70
  );

  let attempts = 1;
  const targetExceededSignificantly = passResult.totalSize > targetBytes * 1.06;

  // If the final size is significantly above target, automatically retry with lower quality/resolution
  if (targetExceededSignificantly) {
    attempts = 2;
    onProgress?.(84, `Target exceeded (${formatBytes(passResult.totalSize)}). Retrying with tighter compression...`);

    const overshootRatio = passResult.totalSize / targetBytes;
    const tightenedBudget = Math.max(
      totalCount * 4500,
      Math.round((availableImageBudget / overshootRatio) * 0.90)
    );

    imageBudgets = computeBudgets(tightenedBudget);

    passResult = await buildPdfPass(
      loadedImages,
      settings,
      imageBudgets,
      true,
      onProgress,
      85,
      12
    );
  }

  onProgress?.(100, `Done! Final PDF: ${formatBytes(passResult.totalSize)}`);
  const pdfBlob = new Blob([passResult.pdfBytes], { type: 'application/pdf' });

  return {
    pdfBlob,
    totalSize: passResult.totalSize,
    pageCount: totalCount,
    targetSizeBytes: targetBytes,
    achievedWithinTarget: passResult.totalSize <= targetBytes * 1.06,
    attempts,
    originalTotalSize: totalInputBytes,
  };
}

/**
 * Formats bytes to human-readable string (e.g. 100 KB, 1.5 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
