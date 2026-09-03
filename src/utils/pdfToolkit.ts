import { PDFDocument, degrees } from 'pdf-lib';

export async function mergePdfFiles(
  files: File[],
  onProgress?: (progress: number, status: string) => void
): Promise<{ pdfBlob: Blob; totalPages: number }> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  onProgress?.(10, 'Initializing merged document...');
  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(
      Math.round(15 + (i / files.length) * 70),
      `Merging file ${i + 1} of ${files.length}: ${file.name}`
    );

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
    totalPages += copiedPages.length;
  }

  onProgress?.(90, 'Saving merged PDF...');
  const mergedBytes = await mergedPdf.save();
  const pdfBlob = new Blob([mergedBytes], { type: 'application/pdf' });
  onProgress?.(100, 'Merge complete!');

  return { pdfBlob, totalPages };
}

export async function rotatePdfDocument(
  file: File,
  angleDegrees: number = 90,
  onProgress?: (progress: number, status: string) => void
): Promise<{ pdfBlob: Blob; pageCount: number }> {
  onProgress?.(20, 'Loading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const pages = pdfDoc.getPages();
  const total = pages.length;

  onProgress?.(50, `Rotating ${total} pages...`);
  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angleDegrees) % 360));
  });

  onProgress?.(85, 'Saving rotated PDF...');
  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  onProgress?.(100, 'Rotation complete!');

  return { pdfBlob, pageCount: total };
}

export async function splitPdfExtract(
  file: File,
  startPage: number,
  endPage: number,
  onProgress?: (progress: number, status: string) => void
): Promise<{ pdfBlob: Blob; extractedCount: number }> {
  onProgress?.(20, 'Reading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalAvailable = sourcePdf.getPageCount();

  const start = Math.max(1, Math.min(startPage, totalAvailable)) - 1;
  const end = Math.max(start + 1, Math.min(endPage, totalAvailable)) - 1;

  onProgress?.(50, `Extracting pages ${start + 1} to ${end + 1}...`);
  const targetPdf = await PDFDocument.create();

  const pageIndicesToCopy: number[] = [];
  for (let i = start; i <= end; i++) {
    pageIndicesToCopy.push(i);
  }

  const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndicesToCopy);
  copiedPages.forEach((page) => targetPdf.addPage(page));

  onProgress?.(85, 'Saving extracted PDF...');
  const pdfBytes = await targetPdf.save();
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  onProgress?.(100, 'Split complete!');

  return { pdfBlob, extractedCount: copiedPages.length };
}
