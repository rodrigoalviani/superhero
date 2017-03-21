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

describe('SuperHero', () => {
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

  describe('List superheroes', () => {
    it('[admin] should return 3 results', (done) => {
      request(app)
        .get('/superhero')
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.total);
          should.equal(res.body.total, 3);
          done();
        });
    });

    it('[standard] should return 3 results', (done) => {
      request(app)
        .get('/superhero')
        .set({Authorization: tokenStandard})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.total);
          should.equal(res.body.total, 3);
          done();
        });
    });

    it('[none] should return a error', (done) => {
      request(app)
        .get('/superhero')
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exist(res.body.err);
          done();
        });
    });
  });

  describe('View superheroes', () => {
    it('[admin] should return superhero data', (done) => {
      request(app)
        .get('/superhero/Superman')
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.name);
          done();
        });
    });

    it('[standard] should return superhero data', (done) => {
      request(app)
        .get('/superhero/Superman')
        .set({Authorization: tokenStandard})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.name);
          done();
        });
    });

    it('[none] should return a error', (done) => {
      request(app)
        .get('/superhero/Superman')
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exist(res.body.err);
          done();
        });
    });
  });

  describe('Create superheroes', () => {
    it ('[admin] should create one superhero', (done) => {
      request(app)
        .post('/superhero')
        .send({name: 'superhero', alias: 'superhero alias', protectionarea: protectionArea, superpowers: superPowers})
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 201);
          should.exists(res.body.message);
          done();
        });
    });

    it ('[standard] should return forbidden', (done) => {
      request(app)
        .post('/superhero')
        .send({name: 'superhero', alias: 'superhero alias', protectionarea: protectionArea, superpowers: superPowers})
        .set({Authorization: tokenStandard})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 403);
          should.exists(res.body.err);
          done();
        });
    });

    it ('[none] should return unauthorized', (done) => {
      request(app)
        .post('/superhero')
        .send({name: 'superhero', alias: 'superhero alias', protectionarea: protectionArea, superpowers: superPowers})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exists(res.body.err);
          done();
        });
    });
  });

  describe('Update superheroes', () => {
    it ('[admin] should edit one superhero', (done) => {
      request(app)
        .put('/superhero/superhero')
        .send({name: 'superhero', alias: 'superhero alias', protectionarea: protectionArea, superpowers: superPowers})
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exists(res.body.message);
          done();
        });
    });

    it ('[standard] should return forbidden', (done) => {
      request(app)
        .put('/superhero/superhero')
        .send({name: 'superhero', alias: 'superhero alias', protectionarea: protectionArea, superpowers: superPowers})
        .set({Authorization: tokenStandard})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 403);
          should.exists(res.body.err);
          done();
        });
    });

    it ('[none] should return unauthorized', (done) => {
      request(app)
        .put('/superhero/superhero')
        .send({name: 'superhero', alias: 'superhero alias', protectionarea: protectionArea, superpowers: superPowers})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exists(res.body.err);
          done();
        });
    });
  });

  describe('Delete superheroes', () => {
    it ('[admin] should delete one superhero', (done) => {
      request(app)
        .delete('/superhero/superhero')
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exists(res.body.message);
          done();
        });
    });

    it ('[standard] should return forbidden', (done) => {
      request(app)
        .delete('/superhero/superhero')
        .set({Authorization: tokenStandard})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 403);
          should.exists(res.body.err);
          done();
        });
    });

    it ('[none] should return unauthorized', (done) => {
      request(app)
        .delete('/superhero/superhero')
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exists(res.body.err);
          done();
        });
    });
  });


  after(helper.dropDb);
});