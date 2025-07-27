const fs = require('fs-extra');
const path = require('path');

async function copyStaticFiles() {
  const sourceDir = path.join(__dirname, '..', '.next', 'static');
  const targetDir = path.join(__dirname, '..', '.next', 'standalone', '.next', 'static');
  
  try {
    console.log(`Copying static files from ${sourceDir} to ${targetDir}...`);
    
    await fs.ensureDir(path.dirname(targetDir));
    
    await fs.copy(sourceDir, targetDir);
    
    console.log('Successfully copied static files.');
  } catch (err) {
    console.error('Error copying static files:', err);
    process.exit(1);
  }
}

copyStaticFiles();