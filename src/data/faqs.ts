export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    question: "Is it really safe to convert my sensitive photos and documents here?",
    answer: "Yes, 100%. Unlike conventional online tools like iLovePDF that transfer your files over the internet to remote servers, OnlineImageToPdf.com performs the entire conversion locally inside your web browser. Your private images, contracts, and sensitive personal files never leave your device."
  },
  {
    question: "How does OnlineImageToPdf compare to iLovePDF?",
    answer: "iLovePDF uploads your files to third-party cloud servers, imposes file-size restrictions, puts users into processing queues, and gates features behind paid subscriptions. OnlineImageToPdf is engineered on modern WebAssembly and client-side JavaScript (pdf-lib): it has zero upload time, zero risk of data leakage, unlimited free usage, and works even when your internet connection is unstable."
  },
  {
    question: "What image formats are supported by the Image to PDF converter?",
    answer: "We support JPG, JPEG, PNG, WebP, GIF, BMP, SVG, and HEIC (Apple iPhone formats). You can mix and match different file formats in a single batch, reorder them, and generate a cohesive, single PDF document."
  },
  {
    question: "Can I customize the page orientation, margin, and paper size?",
    answer: "Yes. You have full control over: Page sizes (A4, US Letter, Legal, or Fit to Image), Orientations (Auto-detect based on photo, Portrait, or Landscape), Margins (No margin, Small, Medium, or Large), and Image Fit (Contain or Fill)."
  },
  {
    question: "Is there a limit on how many images or files I can process?",
    answer: "There are no artificial limits or daily paywalls. Because the computation runs directly on your computer or phone CPU/RAM, you can convert dozens of images without hitting a quota."
  },
  {
    question: "Does it work on smartphones and tablets?",
    answer: "Absolutely. The interface is fully responsive and touch-optimized. You can take photos with your iPhone or Android camera, select them from your camera roll, adjust settings, and download your PDF instantly."
  },
  {
    question: "How are 'Coming Soon' tools handled?",
    answer: "We believe in honest software without fake buttons or deceptive marketing. Any tool marked 'Coming Soon' is actively under development to meet our strict 100% client-side privacy standard. All currently active tools (such as Image to PDF, Merge PDF, Split PDF, Rotate PDF) are completely functional today."
  }
];
