'use strict';

const fs = require('fs');
const controllers = {};
const inflection = require('inflection');

fs.readdirSync(__dirname).forEach((file) => {
  let filePath = __dirname + '/' + file;
  if (fs.statSync(filePath).isFile() && file != 'index.js' && /.*.js/.test(file)) {
    let controllerName = inflection.camelize(file.replace('.js', '').replace('-', '_'), true);
    console.log('[Loaded Controller %s]', file);
    controllers[controllerName] = require(filePath);
  };
});

module.exports = controllers;