const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'dist', 'ngx-tooltip-directives-demo', 'index.html');
const destPath = path.join(__dirname, 'dist', 'ngx-tooltip-directives-demo', '404.html');

fs.copyFile(srcPath, destPath, (err) => {
  if (err) throw err;
  console.log('index.html was copied to 404.html');
});
