'use strict';

const mongoose = require('mongoose');
const util = require('../controllers/util');
const config = require('../config/config.json');
mongoose.Promise = global.Promise;

const UserSchema = new mongoose.Schema({
  username: {
  	type: String,
  	required: true,
  	index: { unique: true }
  },
  password: {
  	type: String,
  	required: true
  },
  roles: {
    type: [String],
    default: ['Standard'],
    enum: ['Standard', 'Admin']
  }
});

UserSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = util.hashPassword(this.password);
  }
  next();
});

mongoose.model('User', UserSchema);