const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Brand colors
const brandColor = '#0f172a'; // zinc-900
const accentColor = '#3b82f6'; // blue-500

// Create SVG for the icon (Money symbol with gradient)
const createIconSvg = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${accentColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${brandColor}" rx="${size * 0.15}"/>

  <!-- Money icon design -->
  <g transform="translate(${size * 0.5}, ${size * 0.5})">
    <!-- Outer circle -->
    <circle cx="0" cy="0" r="${size * 0.35}" fill="none" stroke="url(#grad)" stroke-width="${size * 0.05}"/>

    <!-- Yen symbol (¥) -->
    <g fill="url(#grad)">
      <!-- Top V shape -->
      <path d="M ${-size * 0.15} ${-size * 0.25} L 0 ${-size * 0.05} L ${size * 0.15} ${-size * 0.25}"
            stroke="url(#grad)" stroke-width="${size * 0.04}" stroke-linecap="round" fill="none"/>

      <!-- Horizontal lines -->
      <rect x="${-size * 0.15}" y="${-size * 0.02}" width="${size * 0.3}" height="${size * 0.025}" rx="${size * 0.0125}"/>
      <rect x="${-size * 0.15}" y="${size * 0.04}" width="${size * 0.3}" height="${size * 0.025}" rx="${size * 0.0125}"/>

      <!-- Vertical line -->
      <rect x="${-size * 0.0125}" y="${-size * 0.05}" width="${size * 0.025}" height="${size * 0.3}" rx="${size * 0.0125}"/>
    </g>
  </g>
</svg>
`;

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    const svg = createIconSvg(size);
    const outputPath = path.join(iconsDir, `icon-${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated icon-${size}.png`);
  }

  console.log('\n✨ PWA icons generated successfully!');
}

generateIcons().catch(console.error);
