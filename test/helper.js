'use strict';

const mongoose = require('mongoose');
const child_process = require('child_process');

exports.createAdmin = (done) => {
  let child = child_process.fork(__dirname + '/../fixtures/createAdmin');
  child.on('exit', done);
};

exports.createStandard = (done) => {
  let child = child_process.fork(__dirname + '/../fixtures/createStandard');
  child.on('exit', done);
};

exports.createRole = (done) => {
  let child = child_process.fork(__dirname + '/../fixtures/createRole');
  child.on('exit', done);
};

exports.createSuperPower = (done) => {
  let child = child_process.fork(__dirname + '/../fixtures/createSuperPower');
  child.on('exit', done);
};

exports.createProtectionArea = (done) => {
  let child = child_process.fork(__dirname + '/../fixtures/createProtectionArea');
  child.on('exit', done);
};

exports.createSuperHero = (done) => {
  let child = child_process.fork(__dirname + '/../fixtures/createSuperHero');
  child.on('exit', done);
};

exports.dropDb = (done) => {
  if (process.env.NODE_ENV !== 'test') return done(new Error('Sorry! Can\'t drop a non testing database!'));

  mongoose.connection.db.dropDatabase(done);
};