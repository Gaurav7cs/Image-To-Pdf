import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Upload, Trash2, ArrowLeft, ArrowRight, Download, RefreshCw, FileCheck, Combine, AlertCircle, ShieldCheck } from 'lucide-react';
import { mergePdfFiles } from '../../utils/pdfToolkit';
import { formatBytes } from '../../utils/pdfGenerator';

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
}

export default function MergePdfTool() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [mergedPdf, setMergedPdf] = useState<{
    blobUrl: string;
    fileName: string;
    totalPages: number;
    fileSize: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | File[]) => {
    setError(null);
    const arr = Array.from(incoming);
    const pdfs = arr.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));

    if (pdfs.length < arr.length) {
      setError('Only PDF files are supported for merging.');
    }

    const newItems: PdfFileItem[] = pdfs.map(f => ({
      id: Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      file: f,
      name: f.name,
      size: f.size,
    }));

    setFiles(prev => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= files.length) return;
    setFiles(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setMergedPdf(null);
    setError(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const rawFiles = files.map(f => f.file);
      const res = await mergePdfFiles(rawFiles, (p, msg) => {
        setProgress(p);
        setStatusMessage(msg);
      });

      const blobUrl = URL.createObjectURL(res.pdfBlob);
      setMergedPdf({
        blobUrl,
        fileName: 'merged_document.pdf',
        totalPages: res.totalPages,
        fileSize: res.pdfBlob.size,
      });

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}

    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to merge PDF files.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Privacy guarantee */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-emerald-50/80 dark:bg-neutral-900/80 border border-emerald-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-800 dark:text-neutral-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="text-neutral-950 dark:text-white font-semibold">100% Private PDF Merging:</strong> Merged entirely inside your browser. No files sent to servers.
          </span>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-neutral-700 text-[11px] font-mono font-semibold text-neutral-800 dark:text-neutral-200">
          Client-Native
        </span>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 rounded-xl text-sm text-red-800 dark:text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-xs font-bold text-red-700 hover:text-red-950 px-2 py-1">Dismiss</button>
        </div>
      )}

      {mergedPdf ? (
        <div className="p-6 sm:p-10 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center shadow-xs">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-950 dark:text-white">PDFs Successfully Merged!</h3>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            Combined {files.length} documents into {mergedPdf.totalPages} pages ({formatBytes(mergedPdf.fileSize)}).
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <a
              href={mergedPdf.blobUrl}
              download={mergedPdf.fileName}
              className="w-full sm:w-auto flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-full font-bold text-sm hover:opacity-90 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Merged PDF
            </a>
            <button
              type="button"
              onClick={clearAll}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 border border-neutral-300 dark:border-neutral-800 rounded-full text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all cursor-pointer"
            >
              Merge More Files
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-neutral-300 dark:border-neutral-800 hover:border-neutral-500 bg-neutral-50/70 dark:bg-neutral-950/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex items-center justify-center shadow-xs">
              <Combine className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
              Select PDF files to merge
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1.5 max-w-md mx-auto">
              Select 2 or more PDF documents. Drag to rearrange their order.
            </p>
          </div>

          {files.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-sm font-bold text-neutral-950 dark:text-white">
                  PDF Documents ({files.length})
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 dark:text-red-400 cursor-pointer p-1"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2">
                {files.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-mono font-bold text-neutral-900 dark:text-white text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-neutral-950 dark:text-neutral-100 truncate text-xs">{item.name}</p>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono font-medium">{formatBytes(item.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Move up"
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, 'up')}
                        className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        disabled={idx === files.length - 1}
                        onClick={() => moveItem(idx, 'down')}
                        className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                      </button>
                      <button
                        type="button"
                        title="Remove"
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {isProcessing && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                    <span>{statusMessage}</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isProcessing || files.length < 2}
                onClick={handleMerge}
                className="mt-5 w-full min-h-[48px] py-3 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Merging Files...
                  </>
                ) : (
                  <>
                    <Combine className="w-4 h-4" />
                    Merge {files.length} PDF Files
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
