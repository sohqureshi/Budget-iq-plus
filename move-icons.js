const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'icons');
const destDir = path.join(__dirname, 'src', 'assets', 'icons');

if (!fs.existsSync(srcDir)) {
  console.log('No icons directory found at', srcDir);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

fs.readdirSync(srcDir).forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  try {
    fs.copyFileSync(srcFile, destFile);
    console.log('Copied', file);
  } catch (e) {
    console.error('Failed to copy', file, e);
  }
});
console.log('Icons copied to', destDir);
