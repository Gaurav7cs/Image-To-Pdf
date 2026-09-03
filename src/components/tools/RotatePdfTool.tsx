import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Upload, RotateCw, Download, FileCheck, ShieldCheck, RefreshCw } from 'lucide-react';
import { rotatePdfDocument } from '../../utils/pdfToolkit';
import { formatBytes } from '../../utils/pdfGenerator';
import { PDFDocument } from 'pdf-lib';

export default function RotatePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [angle, setAngle] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    blobUrl: string;
    fileName: string;
    fileSize: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    try {
      setError(null);
      const ab = await f.arrayBuffer();
      const doc = await PDFDocument.load(ab);
      setFile(f);
      setTotalPages(doc.getPageCount());
    } catch (e: any) {
      setError('Could not inspect PDF structure: ' + e.message);
    }
  };

  const handleRotate = async () => {
    if (!file) return;
    try {
      setIsProcessing(true);
      setError(null);
      const res = await rotatePdfDocument(file, angle);
      const blobUrl = URL.createObjectURL(res.pdfBlob);
      setResult({
        blobUrl,
        fileName: `${file.name.replace('.pdf', '')}_rotated_${angle}deg.pdf`,
        fileSize: res.pdfBlob.size,
      });

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'Error rotating PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-emerald-50/80 dark:bg-neutral-900/80 border border-emerald-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-800 dark:text-neutral-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="text-neutral-950 dark:text-white font-semibold">100% Client-Side Rotation:</strong> Rotated right inside your browser without uploading.
          </span>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-neutral-700 text-[11px] font-mono font-semibold text-neutral-800 dark:text-neutral-200">
          In-Browser
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 rounded-xl text-sm text-red-800 dark:text-red-300 flex items-center justify-between">
          <span className="font-medium">{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-xs font-bold text-red-700 hover:text-red-950 px-2 py-1">Dismiss</button>
        </div>
      )}

      {result ? (
        <div className="p-6 sm:p-10 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center shadow-xs">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-950 dark:text-white">PDF Successfully Rotated!</h3>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            Rotated all {totalPages} pages by {angle}° ({formatBytes(result.fileSize)}).
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <a
              href={result.blobUrl}
              download={result.fileName}
              className="w-full sm:w-auto flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-full font-bold text-sm hover:opacity-90 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Rotated PDF
            </a>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 border border-neutral-300 dark:border-neutral-800 rounded-full text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all cursor-pointer"
            >
              Rotate Another File
            </button>
          </div>
        </div>
      ) : !file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className="border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all border-neutral-300 dark:border-neutral-800 hover:border-neutral-500 bg-neutral-50/70 dark:bg-neutral-950/60"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
            }}
          />
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex items-center justify-center shadow-xs">
            <RotateCw className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
            Select PDF file to rotate
          </h3>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1.5 max-w-md mx-auto">
            Permanently orient sideways or upside down PDF documents.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-neutral-950 dark:text-white text-sm truncate">{file.name}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono font-medium">{totalPages} pages • {formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white cursor-pointer p-1"
            >
              Choose different file
            </button>
          </div>

          <div className="my-6">
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              Choose Rotation Direction
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { deg: 90, label: '90° Clockwise' },
                { deg: 180, label: '180° Upside Down' },
                { deg: 270, label: '270° Counter-CW' },
              ].map(opt => (
                <button
                  key={opt.deg}
                  type="button"
                  onClick={() => setAngle(opt.deg)}
                  className={`min-h-[44px] p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center flex sm:flex-col items-center justify-center gap-2 ${
                    angle === opt.deg
                      ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  <RotateCw className={`w-4 h-4 ${opt.deg === 180 ? 'rotate-180' : opt.deg === 270 ? '-rotate-90' : ''}`} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleRotate}
            className="w-full min-h-[48px] py-3 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 cursor-pointer shadow-xs"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Rotating Pages...
              </>
            ) : (
              <>
                <RotateCw className="w-4 h-4" />
                Rotate All {totalPages} Pages
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
