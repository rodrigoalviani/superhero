'use strict';

const mongoose = require('mongoose');
const util = require('../controllers/util');
const config = require('../config/config.json');
mongoose.Promise = global.Promise;

const SuperHeroSchema = new mongoose.Schema({
  name: {
  	type: String,
  	required: true,
  	index: { unique: true }
  },
  alias: {
  	type: String,
  	required: true
  },
  superpowers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperPower'
  }],
  protectionarea: {
  	type: mongoose.Schema.Types.ObjectId,
  	ref: 'ProtectionArea',
  	required: true
  }
});

mongoose.model('SuperHero', SuperHeroSchema);