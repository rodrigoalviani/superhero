'use strict';

const mongoose = require('mongoose');
const util = require('../controllers/util');
const config = require('../config/config.json');
mongoose.Promise = global.Promise;

const ProtectionAreaSchema = new mongoose.Schema({
  name: {
  	type: String,
  	required: true,
  	index: { unique: true }
  },
  loc: {
    type: [Number],
    index: '2d',
    required: true
  },
  radius: {
    type: Number,
    required: true
  }
});

ProtectionAreaSchema.index({
 loc: '2dsphere'
});

mongoose.model('ProtectionArea', ProtectionAreaSchema);