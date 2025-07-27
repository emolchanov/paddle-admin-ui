const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const version = 'v24.4.1';
const platform = 'darwin-arm64';
const filename = `node-${version}-${platform}.tar.xz`;
const url = `https://nodejs.org/dist/${version}/${filename}`;
const binsDir = path.resolve(__dirname, '../bins');
const archivePath = path.join(binsDir, filename);

if (!fs.existsSync(binsDir)) {
  fs.mkdirSync(binsDir, { recursive: true });
} else {
  console.log(`Directory ${binsDir} already exists.`);
  return;
}

console.log(`Downloading ${url} ...`);
const file = fs.createWriteStream(archivePath);
https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Download error: ${response.statusCode}`);
    return;
  }
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded. Extracting...');
    try {
      execSync(`tar -xf ${archivePath} -C ${binsDir}`);
      console.log('Extracted!');
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      fs.unlinkSync(archivePath); // Clean up the archive file
      console.log('Cleaned up archive file.');
    }
  });
}).on('error', (err) => {
  fs.unlinkSync(archivePath);
  console.error('Download error:', err.message);
});