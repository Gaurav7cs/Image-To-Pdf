import React, { useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Upload, 
  Trash2, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  FileCheck, 
  Download, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal, 
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Gauge
} from 'lucide-react';
import type { 
  ImageFileItem, 
  ConverterSettings, 
  PageSizeOption, 
  OrientationOption, 
  MarginOption, 
  ImageFitOption, 
  QualityOption,
  TargetSizeOption,
  TargetUnit
} from '../../types/tools';
import { 
  generatePdfFromImages, 
  formatBytes, 
  calculateEstimatedPdfSize,
  TARGET_SIZE_PRESETS,
  getTargetBytes 
} from '../../utils/pdfGenerator';

interface Props {
  initialToolName?: string;
}

export default function ImageToPdfConverter({ initialToolName = 'Image to PDF' }: Props) {
  const [items, setItems] = useState<ImageFileItem[]>([]);
  const [settings, setSettings] = useState<ConverterSettings>({
    pageSize: 'a4',
    orientation: 'auto',
    margin: 'small',
    imageFit: 'fit',
    quality: 'high',
    fileName: 'onlineimagetopdf_converted.pdf',
    mergeAll: true,
    targetSize: 'original',
    customTargetValue: 500,
    customTargetUnit: 'KB',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [generatedPdf, setGeneratedPdf] = useState<{
    blobUrl: string;
    fileName: string;
    fileSize: number;
    pageCount: number;
    targetSizeBytes: number | null;
    achievedWithinTarget: boolean;
    attempts: number;
    originalTotalSize: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle incoming files
  const handleFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const validImageTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/svg+xml',
      'image/heic',
      'image/heif'
    ];

    const newItems: ImageFileItem[] = [];
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    let invalidCount = 0;

    for (const file of fileArray) {
      const isExtensionImage = /\.(jpe?g|png|webp|gif|bmp|svg|heic|heif)$/i.test(file.name);
      if (!validImageTypes.includes(file.type) && !isExtensionImage) {
        invalidCount++;
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        width: 0,
        height: 0,
        rotation: 0,
      });
    }

    if (invalidCount > 0) {
      setError(`${invalidCount} non-image file(s) were skipped. Supported: JPG, PNG, WEBP, GIF, SVG, HEIC.`);
    }

    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems]);
      // Update default filename based on first file name
      if (items.length === 0) {
        const baseName = newItems[0].name.replace(/\.[^/.]+$/, "");
        setSettings(s => ({ ...s, fileName: `${baseName}_converted.pdf` }));
      }
    }
  }, [items.length]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      const removed = prev.find(item => item.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const rotateItem = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item
      )
    );
  };

  const moveItem = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    setItems(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const clearAll = () => {
    items.forEach(i => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
    setGeneratedPdf(null);
    setError(null);
    setProgress(0);
    setStatusMessage('');
  };

  const startConversion = async () => {
    if (items.length === 0) {
      setError('Please add at least one image to convert.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setProgress(5);
      setStatusMessage('Starting conversion engine...');

      const result = await generatePdfFromImages(items, settings, (p, msg) => {
        setProgress(p);
        setStatusMessage(msg);
      });

      const blobUrl = URL.createObjectURL(result.pdfBlob);
      const outName = settings.fileName.trim().endsWith('.pdf') 
        ? settings.fileName.trim() 
        : `${settings.fileName.trim() || 'converted'}.pdf`;

      setGeneratedPdf({
        blobUrl,
        fileName: outName,
        fileSize: result.totalSize,
        pageCount: result.pageCount,
        targetSizeBytes: result.targetSizeBytes,
        achievedWithinTarget: result.achievedWithinTarget,
        attempts: result.attempts,
        originalTotalSize: result.originalTotalSize,
      });

      // Launch celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0070f3', '#00dfd8', '#7928ca', '#ffffff']
        });
      } catch {
        // ignore if not supported
      }

    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An unexpected error occurred during PDF generation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!generatedPdf) return;
    const a = document.createElement('a');
    a.href = generatedPdf.blobUrl;
    a.download = generatedPdf.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalImageSize = items.reduce((acc, curr) => acc + curr.size, 0);
  const estimatedInfo = calculateEstimatedPdfSize(items, settings);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Privacy guarantee banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-emerald-50/80 dark:bg-neutral-900/80 border border-emerald-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-800 dark:text-neutral-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="text-neutral-950 dark:text-white font-semibold">100% Client-Side Privacy:</strong> Your photos are processed in your browser. No files are uploaded to any server.
          </span>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-neutral-700 text-[11px] font-mono font-semibold text-neutral-800 dark:text-neutral-200">
          Client-Native Engine
        </span>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 rounded-xl text-sm text-red-800 dark:text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button 
            type="button"
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-950 dark:text-red-400 dark:hover:text-red-200 text-xs font-bold px-2 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Download Screen */}
      {generatedPdf ? (
        <div className="p-6 sm:p-10 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-500/5">
            <FileCheck className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Your PDF is Ready!
          </h3>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            Successfully generated <span className="font-bold text-neutral-950 dark:text-white">{generatedPdf.fileName}</span> with {generatedPdf.pageCount} page{generatedPdf.pageCount > 1 ? 's' : ''}.
          </p>

          {/* Size & Optimization Metrics Card */}
          <div className="my-6 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center sm:text-left">
              <div className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Actual File Size
                </p>
                <p className="mt-1 text-lg font-bold font-mono text-neutral-950 dark:text-white">
                  {formatBytes(generatedPdf.fileSize)}
                </p>
              </div>

              {generatedPdf.targetSizeBytes ? (
                <div className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                  <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Target PDF Size
                  </p>
                  <p className="mt-1 text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                    {formatBytes(generatedPdf.targetSizeBytes)}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                  <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Quality Mode
                  </p>
                  <p className="mt-1 text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                    Original Uncapped
                  </p>
                </div>
              )}

              <div className="col-span-2 sm:col-span-1 p-3 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Space Saved
                </p>
                <p className="mt-1 text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {generatedPdf.originalTotalSize > generatedPdf.fileSize
                    ? `-${Math.round(((generatedPdf.originalTotalSize - generatedPdf.fileSize) / generatedPdf.originalTotalSize) * 100)}%`
                    : 'Optimal'}
                </p>
              </div>
            </div>

            {/* Target fulfillment badge */}
            {generatedPdf.targetSizeBytes && (
              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  {generatedPdf.achievedWithinTarget ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Target Achieved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400">
                      <Gauge className="w-4 h-4" />
                      Best Visual Quality Achieved
                    </span>
                  )}
                  <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                    ({formatBytes(generatedPdf.fileSize)} of {formatBytes(generatedPdf.targetSizeBytes)})
                  </span>
                </div>
                {generatedPdf.attempts > 1 && (
                  <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-200/70 dark:bg-neutral-800 px-2 py-0.5 rounded">
                    2 Optimization Passes
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
            <button
              type="button"
              onClick={downloadPdf}
              className="w-full sm:w-auto flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-sm rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>

            <button
              type="button"
              onClick={() => {
                setGeneratedPdf(null);
                setProgress(0);
              }}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-sm rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Change Settings
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-sm rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all cursor-pointer"
            >
              New Document
            </button>
          </div>
        </div>
      ) : (
        /* Main Converter Workspace */
        <div className="space-y-6">
          {/* Dropzone / Upload Area */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-10 md:p-12 transition-all duration-200 text-center ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/15 scale-[0.995]'
                : 'border-neutral-300 dark:border-neutral-800 hover:border-neutral-500 dark:hover:border-neutral-600 bg-neutral-50/70 dark:bg-neutral-950/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,.heic,.heif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = '';
              }}
            />

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 mb-4 rounded-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />
              </div>

              <h3 className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                Drag & drop your images here, or{' '}
                <span className="text-blue-600 dark:text-blue-400 underline underline-offset-4 font-bold">browse</span>
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 max-w-md">
                Supports JPG, PNG, WebP, GIF, SVG, BMP, and HEIC photos. Unlimited files.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs font-mono font-semibold">
                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">.JPG</span>
                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">.PNG</span>
                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">.WEBP</span>
                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">.HEIC</span>
                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">.GIF</span>
              </div>
            </div>
          </div>

          {/* Active Image List & Settings Grid */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Images Grid */}
              <div className="lg:col-span-2 space-y-4">
                {/* Image List Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-950 dark:text-white">
                      Selected Images ({items.length})
                    </span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono font-medium">
                      • {formatBytes(totalImageSize)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add More
                    </button>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Thumbnails Cards */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col"
                    >
                      {/* Page number badge */}
                      <div className="absolute top-2 left-2 z-10 px-2.5 py-0.5 rounded-full bg-neutral-950/85 dark:bg-black/85 backdrop-blur-xs text-[11px] font-mono font-semibold text-white">
                        #{index + 1}
                      </div>

                      {/* Top Action buttons */}
                      <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Rotate 90° clockwise"
                          onClick={(e) => {
                            e.stopPropagation();
                            rotateItem(item.id);
                          }}
                          className="w-8 h-8 rounded-lg bg-white/95 dark:bg-neutral-900/95 hover:bg-white dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete image"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="w-8 h-8 rounded-lg bg-white/95 dark:bg-neutral-900/95 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image Thumbnail Container */}
                      <div className="w-full h-44 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-3 overflow-hidden">
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          style={{
                            transform: `rotate(${item.rotation}deg)`,
                            transition: 'transform 0.2s ease',
                          }}
                          className="max-h-full max-w-full object-contain drop-shadow-xs"
                        />
                      </div>

                      {/* Bottom Info & Reorder */}
                      <div className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-1 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate text-xs" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono font-medium">
                            {formatBytes(item.size)} {item.rotation > 0 && `• ${item.rotation}°`}
                          </p>
                        </div>

                        {/* Reorder Buttons (36px touch targets) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            title="Move Earlier"
                            disabled={index === 0}
                            onClick={() => moveItem(index, 'left')}
                            className="w-7 h-7 rounded flex items-center justify-center text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Move Later"
                            disabled={index === items.length - 1}
                            onClick={() => moveItem(index, 'right')}
                            className="w-7 h-7 rounded flex items-center justify-center text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: PDF Output Settings Control Panel */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                      <h4 className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
                        PDF Page Settings
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-semibold text-neutral-600 dark:text-neutral-400">
                      {items.length} page{items.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* 1. Page Size */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      Page Size
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'a4', label: 'A4 (Standard)' },
                        { id: 'letter', label: 'US Letter' },
                        { id: 'legal', label: 'Legal' },
                        { id: 'fit', label: 'Fit to Image' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings(s => ({ ...s, pageSize: opt.id as PageSizeOption }))}
                          className={`min-h-[40px] px-3 py-2 rounded-lg text-xs border text-left transition-all cursor-pointer ${
                            settings.pageSize === opt.id
                              ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-bold shadow-xs'
                              : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-medium'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Orientation */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      Page Orientation
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'auto', label: 'Auto' },
                        { id: 'portrait', label: 'Portrait' },
                        { id: 'landscape', label: 'Landscape' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings(s => ({ ...s, orientation: opt.id as OrientationOption }))}
                          className={`min-h-[40px] px-2 py-2 rounded-lg text-xs border text-center transition-all cursor-pointer ${
                            settings.orientation === opt.id
                              ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-bold shadow-xs'
                              : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-medium'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Margins */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      Page Margins
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: 'none', label: 'None' },
                        { id: 'small', label: 'Small' },
                        { id: 'medium', label: 'Med' },
                        { id: 'large', label: 'Large' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings(s => ({ ...s, margin: opt.id as MarginOption }))}
                          className={`min-h-[38px] px-2 py-1.5 rounded-lg text-xs border text-center transition-all cursor-pointer ${
                            settings.margin === opt.id
                              ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-bold'
                              : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-medium'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Target PDF Size Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        Target PDF Size
                      </label>
                      <span className="text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400">
                        {settings.targetSize === 'original'
                          ? 'Original Quality'
                          : settings.targetSize === 'custom'
                          ? `${settings.customTargetValue || 500} ${settings.customTargetUnit}`
                          : TARGET_SIZE_PRESETS.find(p => p.id === settings.targetSize)?.label}
                      </span>
                    </div>

                    {/* Presets grid */}
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, targetSize: 'original' }))}
                        className={`col-span-4 min-h-[38px] px-3 py-2 rounded-lg text-xs border flex items-center justify-between transition-all cursor-pointer ${
                          settings.targetSize === 'original'
                            ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-bold shadow-xs'
                            : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-medium'
                        }`}
                      >
                        <span>Original Quality</span>
                        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          settings.targetSize === 'original'
                            ? 'bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-950'
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}>
                          No Size Limit
                        </span>
                      </button>

                      {[
                        { id: '100kb', label: '100 KB' },
                        { id: '200kb', label: '200 KB' },
                        { id: '500kb', label: '500 KB' },
                        { id: '1mb', label: '1 MB' },
                        { id: '2mb', label: '2 MB' },
                        { id: '5mb', label: '5 MB' },
                        { id: '10mb', label: '10 MB' },
                        { id: 'custom', label: 'Custom' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSettings(s => ({ ...s, targetSize: opt.id as TargetSizeOption }))}
                          className={`min-h-[38px] px-1.5 py-2 rounded-lg text-xs border text-center transition-all cursor-pointer ${
                            settings.targetSize === opt.id
                              ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-bold shadow-xs'
                              : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-medium'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom size input */}
                    {settings.targetSize === 'custom' && (
                      <div className="mt-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                            Custom Target Size
                          </label>
                          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                            Target: {settings.customTargetValue || 500} {settings.customTargetUnit}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="10"
                            max="999"
                            step="1"
                            value={settings.customTargetValue}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 0);
                              setSettings(s => ({ ...s, customTargetValue: val }));
                            }}
                            placeholder="500"
                            className="flex-1 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                          />
                          <div className="inline-flex rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 p-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSettings(s => ({ ...s, customTargetUnit: 'KB' }))}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                settings.customTargetUnit === 'KB'
                                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                              }`}
                            >
                              KB
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettings(s => ({ ...s, customTargetUnit: 'MB' }))}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                settings.customTargetUnit === 'MB'
                                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                              }`}
                            >
                              MB
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Small helpful note required by prompt */}
                    <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                      <span>Smaller file sizes may reduce image quality.</span>
                    </p>

                    {/* Live size estimation preview card */}
                    <div className="mt-2.5 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                      <span className="text-neutral-600 dark:text-neutral-400 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Estimated PDF Size:
                      </span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                        {estimatedInfo.formatted}
                      </span>
                    </div>

                    {/* Alert if target is very small */}
                    {estimatedInfo.warning && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <span>{estimatedInfo.warning}</span>
                      </div>
                    )}
                  </div>

                  {/* 5. Image Fit & Compression Quality */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                        Image Fit
                      </label>
                      <select
                        value={settings.imageFit}
                        onChange={(e) => setSettings(s => ({ ...s, imageFit: e.target.value as ImageFitOption }))}
                        className="w-full min-h-[40px] px-3 py-2 rounded-lg text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium focus:outline-hidden focus:ring-1 focus:ring-neutral-400 cursor-pointer"
                      >
                        <option value="fit">Fit (Preserve Ratio)</option>
                        <option value="fill">Fill (Stretch)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                        {settings.targetSize === 'original' ? 'Compression' : 'Auto-Optimization'}
                      </label>
                      {settings.targetSize === 'original' ? (
                        <select
                          value={settings.quality}
                          onChange={(e) => setSettings(s => ({ ...s, quality: e.target.value as QualityOption }))}
                          className="w-full min-h-[40px] px-3 py-2 rounded-lg text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium focus:outline-hidden focus:ring-1 focus:ring-neutral-400 cursor-pointer"
                        >
                          <option value="high">High (Original)</option>
                          <option value="medium">Medium (80%)</option>
                          <option value="low">Small File (60%)</option>
                        </select>
                      ) : (
                        <div className="w-full min-h-[40px] px-3 py-2 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">Target Optimizer</span>
                          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">
                            Active
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 6. Custom Output Filename */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      Output PDF Name
                    </label>
                    <input
                      type="text"
                      value={settings.fileName}
                      onChange={(e) => setSettings(s => ({ ...s, fileName: e.target.value }))}
                      placeholder="document.pdf"
                      className="w-full min-h-[40px] px-3 py-2 rounded-lg text-xs font-mono font-medium bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>

                  {/* Conversion Progress Bar */}
                  {isProcessing && (
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-xs text-neutral-700 dark:text-neutral-300">
                        <span className="truncate pr-2 font-medium">{statusMessage || 'Processing...'}</span>
                        <span className="font-mono font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-200 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Primary Convert Button (Min 48px touch target) */}
                  <button
                    type="button"
                    disabled={isProcessing || items.length === 0}
                    onClick={startConversion}
                    className="w-full min-h-[48px] py-3 px-4 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Convert to PDF ({items.length} {items.length === 1 ? 'Page' : 'Pages'}
                        {settings.targetSize !== 'original' ? ` • Target: ${settings.targetSize === 'custom' ? `${settings.customTargetValue || 500} ${settings.customTargetUnit}` : settings.targetSize.toUpperCase()}` : ''})
                      </>
                    )}
                  </button>

                  <div className="mt-3 text-center">
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium flex items-center justify-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Client-side render • Instant download
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
