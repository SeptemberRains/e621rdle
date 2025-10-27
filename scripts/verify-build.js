#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build...');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

// Check if dist folder exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Dist folder does not exist!');
  console.log('Please run: npm run build');
  process.exit(1);
}

// Check if index.html exists
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in dist folder!');
  console.log('Build may have failed. Please check build logs.');
  process.exit(1);
}

// List dist folder contents
const files = fs.readdirSync(distPath);
console.log('✅ Build verification successful!');
console.log(`📁 Dist folder contents: ${files.join(', ')}`);

// Check if index.html has content
const indexContent = fs.readFileSync(indexPath, 'utf8');
if (indexContent.length < 100) {
  console.warn('⚠️  index.html seems too small, build may be incomplete');
} else {
  console.log('✅ index.html has content');
}

console.log('🚀 Build is ready for deployment!');
