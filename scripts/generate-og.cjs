const sharp = require('sharp');
const path = require('path');

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="50%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="50%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Border Frame -->
  <rect x="24" y="24" width="1152" height="582" rx="24" fill="none" stroke="#27272a" stroke-width="2"/>

  <!-- Top Badge -->
  <g transform="translate(600, 100)">
    <rect x="-195" y="-20" width="390" height="40" rx="20" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
    <circle cx="-165" cy="0" r="6" fill="#10b981"/>
    <text x="-145" y="6" fill="#e4e4e7" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="1">100% CLIENT-SIDE • ZERO SERVER UPLOADS</text>
  </g>

  <!-- Main Headline -->
  <text x="600" y="215" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="76" font-weight="900" letter-spacing="-2">Image To Pdf</text>
  <text x="600" y="280" text-anchor="middle" fill="url(#accent)" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700">Free Online Image to PDF Converter &amp; Maker</text>

  <!-- Description -->
  <text x="600" y="340" text-anchor="middle" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400">Convert JPG, PNG, WebP &amp; HEIC • Image to PDF 100KB &amp; 200KB • Merge PDF • PDF to JPG</text>

  <!-- Feature Grid Pills -->
  <g transform="translate(140, 405)">
    <!-- Pill 1 -->
    <rect x="0" y="0" width="280" height="54" rx="14" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
    <text x="140" y="33" text-anchor="middle" fill="#fafafa" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600">⚡ JPG to PDF Fast</text>

    <!-- Pill 2 -->
    <rect x="310" y="0" width="300" height="54" rx="14" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
    <text x="460" y="33" text-anchor="middle" fill="#fafafa" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600">🎯 Target 100KB &amp; 200KB Resize</text>

    <!-- Pill 3 -->
    <rect x="640" y="0" width="280" height="54" rx="14" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
    <text x="780" y="33" text-anchor="middle" fill="#fafafa" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600">🔒 100% Private In-Browser</text>
  </g>

  <!-- Footer Brand -->
  <g transform="translate(600, 535)">
    <rect x="-160" y="-18" width="320" height="36" rx="10" fill="#18181b" stroke="#27272a" stroke-width="1"/>
    <text x="0" y="6" text-anchor="middle" fill="#71717a" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600">OnlineImageToPdf.com</text>
  </g>
</svg>`;

async function main() {
  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(outputPath);
  console.log('Successfully generated OG image at:', outputPath);
}

main().catch(console.error);
