'use strict';

const mongoose = require('mongoose');
const util = require('../controllers/util');
const config = require('../config/config.json');
mongoose.Promise = global.Promise;

const SuperPowerSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		index: { unique: true }
	},
	description: {
		type: String,
		required: true
	}
});

mongoose.model('SuperPower', SuperPowerSchema);