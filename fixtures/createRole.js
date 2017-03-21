'use strict';

const config = require('../config/config.json');

let env = process.env.NODE_ENV || config.env;

const mongoose = require('mongoose');
const RoleSchema = require('../models/role').schema;
const dbConfig = require('../config/database')[env];
const Role = mongoose.model('Role', RoleSchema);

mongoose.connect(dbConfig.url, dbConfig.options);
mongoose.Promise = global.Promise;

const disconnectHandler = () => {
  mongoose.disconnect(() => process.exit(0));
};

Role.collection.remove();

let roleData = [
  { name: 'Admin' },
  { name: 'Standard' }
];

Role.collection.insert(roleData, {}, function (err, ok) {
  if (err) console.error(err);
  if (ok)
    console.log("\t\tRoles created!");
  else
    console.error("\t\tThere was an error creating roles!");
  disconnectHandler();
});
