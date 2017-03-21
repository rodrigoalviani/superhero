'use strict';

const config = require('../config/config.json');

let env = process.env.NODE_ENV || config.env;

const mongoose = require('mongoose');
const SuperPowerSchema = require('../models/superpower').schema;
const dbConfig = require('../config/database')[env];
const SuperPower = mongoose.model('SuperPower', SuperPowerSchema);

mongoose.connect(dbConfig.url, dbConfig.options);
mongoose.Promise = global.Promise;

const disconnectHandler = () => {
  mongoose.disconnect(() => process.exit(0));
};

SuperPower.collection.remove();

let superPowerData = [
  { name: 'X-Ray Vision', description: 'The power to see through solid objects or people.' },
  { name: 'Telekinesis', description: 'The power to manipulate objects/matter with the mind.' },
  { name: 'Disintegration', description: 'The power to collapse objects into dust.' },
  { name: 'Electromagnetism Manipulation', description: 'The ability to manipulate electromagnetism.' },
  { name: 'Dimensional Travel', description: 'The power to travel between different dimensions. ' }
];

SuperPower.collection.insert(superPowerData, {}, function (err, ok) {
  if (err) console.error(err);
  if (ok)
    console.log("\t\tSuper Powers created!");
  else
    console.error("\t\tThere was an error creating super powers!");
  disconnectHandler();
});
