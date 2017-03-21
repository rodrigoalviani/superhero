'use strict';

const config = require('../config/config.json');

let env = process.env.NODE_ENV || config.env;

const mongoose = require('mongoose');
const SuperPowerSchema = require('../models/superpower').schema;
const ProtectionAreaSchema = require('../models/protectionarea').schema;
const SuperHeroSchema = require('../models/superhero').schema;
const dbConfig = require('../config/database')[env];
const SuperPower = mongoose.model('SuperPower', SuperPowerSchema);
const ProtectionArea = mongoose.model('ProtectionArea', ProtectionAreaSchema);
const SuperHero = mongoose.model('SuperHero', SuperHeroSchema);

const helper = require('../test/helper');

mongoose.connect(dbConfig.url, dbConfig.options);
mongoose.Promise = global.Promise;

const disconnectHandler = () => {
  mongoose.disconnect(() => process.exit(0));
};

ProtectionArea.findOne({name: 'New York'}, (err, protectionArea) => {
  if (err) console.error(err);
  let protectionarea = protectionArea._id;

  SuperPower.findOne({name: 'Telekinesis'}, (err, superPower) => {
    if (err) console.error(err);
    let superpowers = [superPower._id];

    let Data = [
      { name: 'Superman', alias: 'Clark Kent', protectionarea: protectionarea, superpowers: superpowers },
      { name: 'Wonder Woman', alias: 'Diana Prince', protectionarea: protectionarea, superpowers: superpowers },
      { name: 'Batman', alias: 'Bruce Wayne', protectionarea: protectionarea, superpowers: superpowers }
    ];

    SuperHero.collection.insert(Data, {}, function (err, ok) {
      if (err) console.error(err);
      if (ok)
        console.log("\t\tSuper Heroes created!");
      else
        console.error("\t\tThere was an error creating super heroes!");

      disconnectHandler();
    });
  });
});
