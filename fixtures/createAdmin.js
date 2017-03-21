'use strict';

const config = require('../config/config.json');

let env = process.env.NODE_ENV || config.env;

const mongoose = require('mongoose');
const UserSchema = require('../models/user').schema;
const dbConfig = require('../config/database')[env];
const User = mongoose.model('User', UserSchema);

mongoose.connect(dbConfig.url, dbConfig.options);
mongoose.Promise = global.Promise;

const disconnectHandler = () => {
  mongoose.disconnect(() => process.exit(0));
};

let userData = {
  username: 'admin',
  password: 'change123',
  roles: ['Admin', 'Standard']
};

let user = new User(userData);

User.findOne({username: userData.username}, (err, anyUser) => {
  if (err) console.log(err);
  if (anyUser === null) {
    user.save((err, ok) => {
      if (err) console.error(err);
      if (ok)
        console.log("\t\tUser created!\t" + JSON.stringify(userData));
      else
        console.error("\t\tThere was an error creating the admin user!");
      disconnectHandler();
    });
  } else {
    console.log("\t\tA user already exists on the database!");
    disconnectHandler();
  }
});
