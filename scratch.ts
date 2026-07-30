import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const dir = path.join(process.cwd(), 'src');
let count = 0;

walkDir(dir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    
    // Replace standard hardcoded colors
    content = content.replace(/bg-white/g, 'bg-card');
    content = content.replace(/bg-gray-50/g, 'bg-background');
    content = content.replace(/bg-gray-100/g, 'bg-background'); // often used for hovers or secondary bgs
    content = content.replace(/text-gray-900/g, 'text-primary');
    content = content.replace(/text-gray-800/g, 'text-primary');
    content = content.replace(/text-gray-700/g, 'text-text-secondary');
    content = content.replace(/text-gray-600/g, 'text-text-secondary');
    content = content.replace(/text-gray-500/g, 'text-text-secondary');
    content = content.replace(/border-gray-200/g, 'border-border');
    content = content.replace(/border-gray-300/g, 'border-border');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      count++;
    }
  }
});

console.log(`Updated ${count} files to use theme variables.`);
