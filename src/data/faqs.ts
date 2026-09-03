export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    question: "How to convert image to PDF?",
    answer: "<p>To convert an image to PDF online for free, follow these simple steps:</p><ol><li><strong>Upload your images:</strong> Drag and drop your JPG, PNG, WebP, or HEIC files into the converter area above, or click \"Choose Files\" to browse from your device.</li><li><strong>Customize page settings:</strong> Select your preferred page orientation (Portrait or Landscape), paper size (A4, US Letter, or Fit to Image), and margin width.</li><li><strong>Reorder or rotate pages:</strong> Drag thumbnails to arrange page sequence and click the rotate icon to orient sideways photos properly.</li><li><strong>Convert &amp; download:</strong> Click <strong>Convert to PDF</strong> to generate and download your finalized PDF document instantly. All processing happens 100% locally in your browser with zero server uploads.</li></ol>"
  },
  {
    question: "How to save image as PDF?",
    answer: "<p>You can save an image as a PDF across different devices easily using our free online converter or your device's built-in print features:</p><ul><li><strong>Online via OnlineImageToPdf.com (Universal &amp; Fastest):</strong> Upload your photo to our free <a href=\"/tools/image-to-pdf\">Image to PDF</a> tool, adjust margins or orientation if desired, and click <strong>Convert to PDF</strong> to save it as a high-quality PDF on any phone or computer.</li><li><strong>On Windows:</strong> Double-click the image to open it in the Photos app, press <strong>Ctrl + P</strong> (Print), set the destination printer to <strong>Microsoft Print to PDF</strong>, and click <strong>Print</strong> to save.</li><li><strong>On Mac:</strong> Open the photo in <strong>Preview</strong>, click <strong>File &gt; Export as PDF</strong>, enter a filename, and click <strong>Save</strong>.</li><li><strong>On iPhone &amp; iPad:</strong> Open the photo in the Photos app, tap <strong>Share &gt; Print</strong>, pinch outward on the preview thumbnail to turn it into a PDF, tap Share again, and select <strong>Save to Files</strong>.</li><li><strong>On Android:</strong> Open the photo in Google Photos or Gallery, tap the three dots menu &gt; <strong>Print</strong>, choose <strong>Save as PDF</strong> as the printer, and tap the PDF save icon.</li></ul>"
  },
  {
    question: "How to convert PDF image to Word text?",
    answer: "<p>To convert a PDF containing images or scanned documents into editable Microsoft Word text, you can use Optical Character Recognition (OCR):</p><ul><li><strong>Using Microsoft Word (Desktop):</strong> Open Microsoft Word, go to <strong>File &gt; Open</strong>, and select your PDF. Word will automatically convert the file and use OCR to turn images of text into an editable Word (.docx) document.</li><li><strong>Using Google Docs (Free OCR):</strong> Upload your PDF document to Google Drive, right-click the file, and choose <strong>Open with &gt; Google Docs</strong>. Google Docs will extract the text from the images into an editable document that you can download as Microsoft Word (.docx).</li><li><strong>Extract Images First:</strong> If you need to isolate high-resolution image pages from your PDF before transcribing, use our free <a href=\"/tools/pdf-to-jpg\">PDF to JPG</a> or <a href=\"/tools/pdf-to-png\">PDF to PNG</a> tools to extract crisp image files directly inside your browser.</li></ul>"
  },
  {
    question: "How to convert image to PDF for free?",
    answer: "<p>You can convert images to PDF 100% free with <strong>OnlineImageToPdf.com</strong>. Unlike other online converters that hide features behind subscriptions or add watermarks, our service is completely unrestricted:</p><ul><li><strong>No sign-up or registration:</strong> Convert single or multiple images immediately without creating an account or entering personal details.</li><li><strong>No file limits or quotas:</strong> Convert as many images as you need with unlimited batches and pages.</li><li><strong>No watermarks:</strong> Every generated PDF is clean, professional, and completely watermark-free.</li><li><strong>100% Private Client-Side Engine:</strong> Because file processing happens directly on your device using WebAssembly and HTML5 Canvas, we don't pay high cloud server costs—allowing us to keep this service free forever.</li></ul>"
  },
  {
    question: "How to convert image to PDF 200KB?",
    answer: "<p>Many government exams (such as UPSC, SSC, state service boards), university portals, and job application systems require PDF uploads strictly under 200KB. Here is how to convert image to PDF 200KB:</p><ol><li><strong>Upload your image:</strong> Drag and drop your JPG, PNG, or photo into the converter box.</li><li><strong>Choose the 200KB preset:</strong> In the settings panel, open the <strong>Target PDF File Size</strong> dropdown and select <strong>200 KB</strong> (or enter a custom size like 195 KB to avoid server rounding errors).</li><li><strong>Automatic smart compression:</strong> Our client-side compression engine automatically balances image resolution and JPEG quality in real-time to ensure the final PDF stays strictly under 200KB while keeping signatures, stamps, and text sharp and readable.</li><li><strong>Convert &amp; Download:</strong> Click <strong>Convert to PDF</strong> to download your portal-ready PDF document that uploads without size rejection errors.</li></ol>"
  },
  {
    question: "Can I resize my PDF?",
    answer: "<p>Yes! You can resize your PDF in two important ways:</p><ul><li><strong>Resize PDF File Size (Compression):</strong> If your PDF file is too large to email or upload to an online portal, you can reduce its file size using our target size presets (100KB, 200KB, 500KB) or our <a href=\"/tools/compress-pdf\">Compress PDF</a> tool. Our client-side compression reduces file weight while preserving document clarity.</li><li><strong>Resize PDF Page Dimensions:</strong> You can resize and reformat the physical page dimensions of your PDF. Choose from standard international paper formats like <strong>A4</strong>, <strong>US Letter</strong>, or <strong>Legal</strong>, or select <strong>Fit to Image</strong> so the PDF page scales exactly to your photo's dimensions without extra borders.</li></ul>"
  },
  {
    question: "Is it safe to convert sensitive photos and documents using this image to PDF maker?",
    answer: "<p>Yes, 100% private and secure. Unlike legacy cloud converters that upload your files over the internet to remote third-party servers, OnlineImageToPdf.com processes everything client-side inside your web browser. Your private tax forms, government IDs, certificates, and personal photos never leave your device.</p>"
  },
  {
    question: "What image formats are supported by this image to PDF converter?",
    answer: "<p>We support all major image formats, including JPG, JPEG, PNG (with transparency support), WebP, GIF, BMP, SVG, and Apple iPhone HEIC/HEIF photos. You can even combine multiple mixed image formats into a single multi-page PDF document.</p>"
  }
];
