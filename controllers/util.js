'use strict';

const crypto = require('crypto');
const config = require('../config/config.json');

exports.hashPassword = (pass) => crypto.createHash('md5').update(pass + config.salt).digest("hex");