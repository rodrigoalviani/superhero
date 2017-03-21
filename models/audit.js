'use strict';

const mongoose = require('mongoose');
const util = require('../controllers/util');
const config = require('../config/config.json');
mongoose.Promise = global.Promise;

const AuditSchema = new mongoose.Schema({
  entity: {
  	type: String,
  	required: true
  },
  entityId: {
    type: String,
    required: true
  },
  datetime: {
    type: Date,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete']
  }
});

mongoose.model('Audit', AuditSchema);