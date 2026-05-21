const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const standalone = path.join(root, 'frontend', '.next', 'standalone');

// Verify standalone build exists
if (!fs.existsSync(standalone)) {
  console.error('Standalone build not found. Run "npm run build" in frontend directory first.');
  process.exit(1);
}

const copies = [
  {
    src: path.join(root, 'frontend', '.next', 'static'),
    dst: path.join(standalone, 'frontend', '.next', 'static'),
    label: '.next/static',
  },
  {
    src: path.join(root, 'frontend', 'public'),
    dst: path.join(standalone, 'frontend', 'public'),
    label: 'public/',
  },
];

for (const { src, dst, label } of copies) {
  if (!fs.existsSync(src)) {
    console.error(`Missing: ${src}`);
    process.exit(1);
  }
  fs.cpSync(src, dst, { recursive: true });
  console.log(`Copied ${label} → ${path.relative(root, dst)}`);
}

console.log('Static assets ready for Electron standalone build.');
