'use strict';

process.env.NODE_ENV = 'test';

const app = require('../index');
const request = require('supertest');
const should = require('should');
const config = require('../config/config.json');
const helper = require('./helper');
const mongoose = require('mongoose');
const ProtectionArea = mongoose.model('ProtectionArea');
const SuperPower = mongoose.model('SuperPower');

let tokenAdmin = '';
let tokenStandard = '';
let protectionArea = '';
let superPowers = [];

describe('HelpMe', () => {
  before(helper.createRole);
  before(helper.createAdmin);
  before(helper.createStandard);
  before(helper.createSuperPower);
  before(helper.createProtectionArea);
  before(helper.createSuperHero);

  describe('Auth users', () => {
    it('[admin] should return a token', (done) => {
      request(app)
        .post('/login')
        .send({username: 'admin', password: 'change123'})
        .end((err, res) => {
          tokenAdmin = res.body.token;
          done();
        });
    });

    it('[standard] should return a token', (done) => {
      request(app)
        .post('/login')
        .send({username: 'standard', password: 'change123'})
        .end((err, res) => {
          tokenStandard = res.body.token;
          done();
        });
    });
  });

  describe('Get arguments', () => {
    it('[none] get protectionarea', (done) => {
      ProtectionArea.findOne({}, (err, doc) => {
        protectionArea = doc._id;
        done();
      });
    });

    it('[none] get superpower', (done) => {
      SuperPower.findOne({}, (err, doc) => {
        superPowers.push(doc._id);
        done();
      });
    });
  });

  describe('Search near heroes', () => {
    it('[admin] should return 3 results', (done) => {
      request(app)
        .get('/helpme?lat=40.73061&lng=-73.935242')
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.heroes);
          should.equal(res.body.heroes.length, 3);
          done();
        });
    });

    it('[standard] should return 3 results', (done) => {
      request(app)
        .get('/helpme?lat=40.73061&lng=-73.935242')
        .set({Authorization: tokenStandard})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.heroes);
          should.equal(res.body.heroes.length, 3);
          done();
        });
    });

    it('[none] should return a error', (done) => {
      request(app)
        .get('/helpme?lat=40.73061&lng=-73.935242')
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exists(res.body.err);
          done();
        });
    });

    it('[admin] should return 404', (done) => {
      request(app)
        .get('/helpme?lat=10.73061&lng=-20.935242')
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 404);
          done();
        });
    });
  });

  after(helper.dropDb);
});