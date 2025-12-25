#!/usr/bin/env node

/**
 * Convert SVG icon to ICNS format for macOS
 * This script uses Node.js to convert SVG to PNG and then to ICNS
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ICONSET_DIR = 'icon.iconset';
const SVG_FILE = 'icon.svg';
const ICNS_FILE = 'icon.icns';

// Required icon sizes for ICNS
const iconSizes = [
  { name: 'icon_16x16.png', size: 16 },
  { name: 'icon_16x16@2x.png', size: 32 },
  { name: 'icon_32x32.png', size: 32 },
  { name: 'icon_32x32@2x.png', size: 64 },
  { name: 'icon_128x128.png', size: 128 },
  { name: 'icon_128x128@2x.png', size: 256 },
  { name: 'icon_256x256.png', size: 256 },
  { name: 'icon_256x256@2x.png', size: 512 },
  { name: 'icon_512x512.png', size: 512 },
  { name: 'icon_512x512@2x.png', size: 1024 },
];

function checkDependencies() {
  try {
    require.resolve('sharp');
    return 'sharp';
  } catch (e) {
    // Try to use macOS built-in tools
    if (process.platform === 'darwin') {
      try {
        execSync('which sips', { stdio: 'ignore' });
        // Check if we can use qlmanage or other tools
        return 'native';
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

function convertWithSharp() {
  const sharp = require('sharp');
  
  // Clean up old iconset
  if (fs.existsSync(ICONSET_DIR)) {
    fs.rmSync(ICONSET_DIR, { recursive: true });
  }
  fs.mkdirSync(ICONSET_DIR, { recursive: true });

  console.log('Converting SVG to PNG at various sizes...');
  
  const promises = iconSizes.map(({ name, size }) => {
    return sharp(SVG_FILE)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONSET_DIR, name));
  });

  return Promise.all(promises).then(() => {
    console.log('✓ All PNG files created');
    return true;
  });
}

function convertWithNative() {
  console.log('Using macOS native tools...');
  console.log('Note: This requires manual conversion or installing a tool.');
  console.log('\nOption 1: Install sharp package:');
  console.log('  npm install --save-dev sharp');
  console.log('\nOption 2: Install librsvg:');
  console.log('  brew install librsvg');
  console.log('  Then run: ./convert-icon.sh');
  console.log('\nOption 3: Use online converter or image editor');
  return false;
}

function createICNS() {
  if (!fs.existsSync(ICONSET_DIR)) {
    console.error('Error: iconset directory not found');
    return false;
  }

  console.log('Converting iconset to ICNS...');
  try {
    execSync(`iconutil -c icns "${ICONSET_DIR}" -o "${ICNS_FILE}"`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log('✓ Successfully created icon.icns');
    
    // Clean up iconset directory
    fs.rmSync(ICONSET_DIR, { recursive: true });
    return true;
  } catch (error) {
    console.error('Error converting to ICNS:', error.message);
    return false;
  }
}

// Main execution
console.log('Converting icon.svg to icon.icns...\n');

if (!fs.existsSync(SVG_FILE)) {
  console.error(`Error: ${SVG_FILE} not found`);
  process.exit(1);
}

const method = checkDependencies();

if (method === 'sharp') {
  convertWithSharp()
    .then(() => createICNS())
    .catch(error => {
      console.error('Error during conversion:', error.message);
      console.log('\nTrying alternative method...');
      convertWithNative();
      process.exit(1);
    });
} else {
  convertWithNative();
  process.exit(1);
}

