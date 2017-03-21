'use strict';

const mongoose = require('mongoose');
const util = require('../controllers/util');
const config = require('../config/config.json');
mongoose.Promise = global.Promise;

const RoleSchema = new mongoose.Schema({
  name: {
  	type: String,
  	required: true,
  	index: { unique: true }
  }
});

mongoose.model('Role', RoleSchema);