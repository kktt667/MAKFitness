const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Simple SVG to create icons
function createIconSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FF5C9A" rx="${size * 0.15}"/>
  <text
    x="50%"
    y="50%"
    font-family="Arial, sans-serif"
    font-size="${size * 0.6}"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central">M</text>
</svg>`;
}

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');

  console.log('🎨 Generating MAKFitness icons...\n');

  // Generate 512x512
  const svg512 = Buffer.from(createIconSVG(512));
  await sharp(svg512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✅ Created icon-512.png (512x512)');

  // Generate 192x192
  const svg192 = Buffer.from(createIconSVG(192));
  await sharp(svg192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✅ Created icon-192.png (192x192)');

  // Generate 180x180 for Apple
  const svg180 = Buffer.from(createIconSVG(180));
  await sharp(svg180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Created apple-touch-icon.png (180x180)');

  console.log('\n🎉 All icons generated successfully!');
  console.log('📱 Your app will now have icons when added to home screen');
}

generateIcons().catch(console.error);
