const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
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
    
    // Replace bg-primary text-white with bg-primary text-background
    // Also handle cases where there are spaces between them
    content = content.replace(/bg-primary([^"']*?)text-white/g, 'bg-primary$1text-background');
    content = content.replace(/text-white([^"']*?)bg-primary/g, 'text-background$1bg-primary');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Fixed', filePath);
      count++;
    }
  }
});

console.log(`Updated ${count} files to use text-background on primary buttons.`);
