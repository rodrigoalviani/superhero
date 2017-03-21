'use strict';

const config = require('../config/config.json');

let env = process.env.NODE_ENV || config.env;

const mongoose = require('mongoose');
const ProtectionAreaSchema = require('../models/protectionarea').schema;
const dbConfig = require('../config/database')[env];
const ProtectionArea = mongoose.model('ProtectionArea', ProtectionAreaSchema);

mongoose.connect(dbConfig.url, dbConfig.options);
mongoose.Promise = global.Promise;

const disconnectHandler = () => {
  mongoose.disconnect(() => process.exit(0));
};

let protectionAreaData = [
  { name: 'New York', loc: [-73.935242, 40.730610], radius: 50 },
  { name: 'Philadelphia', loc: [-75.165222, 39.952583], radius: 50 },
  { name: 'Long Island', loc: [-73.138260, 40.792240], radius: 50 }
];

ProtectionArea.collection.insert(protectionAreaData, {}, function (err, ok) {
  if (err) console.error(err);
  if (ok)
    console.log("\t\tProtection Area created!");
  else
    console.error("\t\tThere was an error creating protection area!");
  disconnectHandler();
});
