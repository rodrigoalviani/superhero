'use strict';

const fs = require('fs');

fs.readdirSync(__dirname).forEach((file) => {
  let filePath = __dirname + '/' + file;
  if (fs.statSync(filePath).isFile() && file != 'index.js' && /.*.js/.test(file)) {
    require(filePath);
    console.log('[Loaded Model %s]', file);
  };
});