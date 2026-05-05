/**
 * Generate Smart List PWA icons.
 *
 * Concept: layered "list" cards on a green→blue diagonal gradient. The front
 * card carries three rows whose bullets use the app's status palette
 * (green = stocked / on-track, amber = buy-soon / due-soon, gray = ok).
 *
 * Run: yarn generate-icons
 * Requires: sharp
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');

const ICON_SIZES = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];

function createIconSvg(size: number): string {
  const F = size;

  // Back card (rotated, behind the front card)
  const backW = F * 0.50;
  const backH = F * 0.58;
  const backCx = F * 0.43;
  const backCy = F * 0.43;
  const backRx = F * 0.07;

  // Front card (foreground)
  const frontW = F * 0.58;
  const frontH = F * 0.66;
  const frontCx = F * 0.55;
  const frontCy = F * 0.54;
  const frontRx = F * 0.09;
  const frontLeft = frontCx - frontW / 2;
  const frontRight = frontCx + frontW / 2;
  const frontTop = frontCy - frontH / 2;

  // Three rows on the front card, vertically centered
  const rowH = F * 0.04;
  const rowGap = F * 0.108;
  const rowsTotal = 3 * rowH + 2 * rowGap;
  const rowsTopY = frontTop + (frontH - rowsTotal) / 2;
  const bulletR = F * 0.026;
  const rowPaddingX = F * 0.07;
  const bulletX = frontLeft + rowPaddingX + bulletR;
  const pillX = bulletX + bulletR + F * 0.03;
  const pillMaxRight = frontRight - rowPaddingX;
  const pillW1 = pillMaxRight - pillX;
  const pillW2 = pillW1 * 0.78;
  const pillW3 = pillW1 * 0.55;
  const pillRy = rowH / 2;

  const rowY = (i: number) => rowsTopY + i * (rowH + rowGap);
  const bulletCy = (i: number) => rowY(i) + rowH / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${F}" y2="${F}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#30D158"/>
      <stop offset="1" stop-color="#0A84FF"/>
    </linearGradient>
    <linearGradient id="topHi" x1="0" y1="0" x2="0" y2="${F * 0.45}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="${F}" height="${F}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${F}" height="${F * 0.45}" fill="url(#topHi)"/>

  <g transform="rotate(-7 ${backCx} ${backCy})">
    <rect x="${backCx - backW / 2}" y="${backCy - backH / 2}" width="${backW}" height="${backH}" rx="${backRx}" ry="${backRx}" fill="#ffffff" fill-opacity="0.55"/>
  </g>

  <rect x="${frontLeft}" y="${frontTop}" width="${frontW}" height="${frontH}" rx="${frontRx}" ry="${frontRx}" fill="#ffffff"/>

  <circle cx="${bulletX}" cy="${bulletCy(0)}" r="${bulletR}" fill="#22C55E"/>
  <rect x="${pillX}" y="${rowY(0)}" width="${pillW1}" height="${rowH}" rx="${pillRy}" ry="${pillRy}" fill="#E5E7EB"/>

  <circle cx="${bulletX}" cy="${bulletCy(1)}" r="${bulletR}" fill="#F59E0B"/>
  <rect x="${pillX}" y="${rowY(1)}" width="${pillW2}" height="${rowH}" rx="${pillRy}" ry="${pillRy}" fill="#E5E7EB"/>

  <circle cx="${bulletX}" cy="${bulletCy(2)}" r="${bulletR}" fill="#9CA3AF"/>
  <rect x="${pillX}" y="${rowY(2)}" width="${pillW3}" height="${rowH}" rx="${pillRy}" ry="${pillRy}" fill="#E5E7EB"/>
</svg>`;
}

async function generateIcons() {
  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  console.log('🎨 Generating modern iOS-style blue gradient PWA icons...\n');

  for (const size of ICON_SIZES) {
    const svgContent = createIconSvg(size);
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    
    try {
      await sharp(Buffer.from(svgContent))
        .png({
          quality: 100,
          compressionLevel: 9,
        })
        .toFile(outputPath);
      
      console.log(`  ✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`  ❌ Failed to generate icon-${size}x${size}.png:`, error);
    }
  }

  // Also generate apple-touch-icon.png (180x180 is the standard for iOS)
  const appleTouchIconPath = path.join(ICONS_DIR, 'apple-touch-icon.png');
  const svg180 = createIconSvg(180);
  
  try {
    await sharp(Buffer.from(svg180))
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(appleTouchIconPath);
    console.log(`  ✅ Generated apple-touch-icon.png (180x180)`);
  } catch (error) {
    console.error(`  ❌ Failed to generate apple-touch-icon.png:`, error);
  }

  // Generate favicon.ico alternative as PNG
  const faviconPath = path.join(process.cwd(), 'public', 'favicon-32x32.png');
  const svg32 = createIconSvg(32);
  
  try {
    await sharp(Buffer.from(svg32))
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(faviconPath);
    console.log(`  ✅ Generated favicon-32x32.png`);
  } catch (error) {
    console.error(`  ❌ Failed to generate favicon-32x32.png:`, error);
  }

  // Generate SVG version for reference
  const svgPath = path.join(ICONS_DIR, 'icon.svg');
  fs.writeFileSync(svgPath, createIconSvg(512));
  console.log(`  ✅ Generated icon.svg (512x512 source)`);

  console.log('\n✨ Icon generation complete!');
  console.log('\nGenerated files:');
  console.log('  • public/icons/icon-{size}x{size}.png (all sizes)');
  console.log('  • public/icons/apple-touch-icon.png');
  console.log('  • public/icons/icon.svg');
  console.log('  • public/favicon-32x32.png');
}

generateIcons().catch(console.error);
