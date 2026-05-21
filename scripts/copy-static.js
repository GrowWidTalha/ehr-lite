const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const standalone = path.join(root, 'frontend', '.next', 'standalone');

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

console.log('Static assets ready.');
