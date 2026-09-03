import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Upload, Split, Download, FileCheck, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { splitPdfExtract } from '../../utils/pdfToolkit';
import { formatBytes } from '../../utils/pdfGenerator';
import { PDFDocument } from 'pdf-lib';

export default function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splitResult, setSplitResult] = useState<{
    blobUrl: string;
    fileName: string;
    extractedCount: number;
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
      const count = doc.getPageCount();
      setFile(f);
      setTotalPages(count);
      setStartPage(1);
      setEndPage(count);
    } catch (e: any) {
      setError('Could not inspect PDF structure: ' + e.message);
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    try {
      setIsProcessing(true);
      setError(null);
      const res = await splitPdfExtract(file, startPage, endPage);
      const blobUrl = URL.createObjectURL(res.pdfBlob);
      setSplitResult({
        blobUrl,
        fileName: `${file.name.replace('.pdf', '')}_pages_${startPage}-${endPage}.pdf`,
        extractedCount: res.extractedCount,
        fileSize: res.pdfBlob.size,
      });

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'Error splitting PDF');
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
            <strong className="text-neutral-950 dark:text-white font-semibold">100% Client-Side Page Extraction:</strong> Extracted locally in your browser.
          </span>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-neutral-700 text-[11px] font-mono font-semibold text-neutral-800 dark:text-neutral-200">
          In-Memory
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 rounded-xl text-sm text-red-800 dark:text-red-300 flex items-center justify-between">
          <span className="font-medium">{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-xs font-bold text-red-700 hover:text-red-950 px-2 py-1">Dismiss</button>
        </div>
      )}

      {splitResult ? (
        <div className="p-6 sm:p-10 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center shadow-xs">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-950 dark:text-white">Pages Extracted!</h3>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            Created new PDF with {splitResult.extractedCount} page(s) ({formatBytes(splitResult.fileSize)}).
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <a
              href={splitResult.blobUrl}
              download={splitResult.fileName}
              className="w-full sm:w-auto flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-full font-bold text-sm hover:opacity-90 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Extracted PDF
            </a>
            <button
              type="button"
              onClick={() => {
                setSplitResult(null);
                setFile(null);
              }}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 border border-neutral-300 dark:border-neutral-800 rounded-full text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all cursor-pointer"
            >
              Split Another
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
            <Split className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
            Select PDF file to split
          </h3>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1.5 max-w-md mx-auto">
            Choose a PDF document to extract specific pages or page ranges.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-neutral-950 dark:text-white text-sm truncate">{file.name}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono font-medium">{totalPages} total pages • {formatBytes(file.size)}</p>
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
              Select Page Range to Extract
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">From Page:</span>
                <input
                  type="number"
                  min={1}
                  max={endPage}
                  value={startPage}
                  onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1 w-full min-h-[42px] px-3 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                />
              </div>
              <span className="hidden sm:inline-block text-neutral-500 self-end pb-2.5 font-bold">to</span>
              <div className="flex-1">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">To Page:</span>
                <input
                  type="number"
                  min={startPage}
                  max={totalPages}
                  value={endPage}
                  onChange={(e) => setEndPage(Math.min(totalPages, parseInt(e.target.value) || totalPages))}
                  className="mt-1 w-full min-h-[42px] px-3 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              Extracting {Math.max(1, endPage - startPage + 1)} of {totalPages} pages.
            </p>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSplit}
            className="w-full min-h-[48px] py-3 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 cursor-pointer shadow-xs"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Extracting Pages...
              </>
            ) : (
              <>
                <Split className="w-4 h-4" />
                Extract Selected Pages
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
