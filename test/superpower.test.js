'use strict';

process.env.NODE_ENV = 'test';

const app = require('../index');
const request = require('supertest');
const should = require('should');
const config = require('../config/config.json');
const helper = require('./helper');

let tokenAdmin = '';
let tokenStandard = '';

describe('SuperPower', () => {
  before(helper.createRole);
  before(helper.createAdmin);
  before(helper.createStandard);
  before(helper.createSuperPower);

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

  describe('List superpowers', () => {
    it('[admin] should return 5 results', (done) => {
      request(app)
        .get('/superpower')
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.total);
          should.equal(res.body.total, 5);
          done();
        });
    });

    it('[standard] should return 5 results', (done) => {
      request(app)
        .get('/superpower')
        .set({Authorization: tokenStandard})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.total);
          should.equal(res.body.total, 5);
          done();
        });
    });

    it('[none] should return a error', (done) => {
      request(app)
        .get('/superpower')
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exist(res.body.err);
          done();
        });
    });
  });

  describe('View superpowers', () => {
    it('[admin] should return superpower data', (done) => {
      request(app)
        .get('/superpower/Telekinesis')
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.name);
          done();
        });
    });

    it('[standard] should return superpower data', (done) => {
      request(app)
        .get('/superpower/Telekinesis')
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
        .get('/superpower/Telekinesis')
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exist(res.body.err);
          done();
        });
    });
  });

  describe('Create superpowers', () => {
    it ('[admin] should create one superpower', (done) => {
      request(app)
        .post('/superpower')
        .send({name: 'superpower', description: 'superpower description'})
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
        .post('/superpower')
        .send({name: 'superpower', description: 'superpower description'})
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
        .post('/superpower')
        .send({name: 'superpower', description: 'superpower description'})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exists(res.body.err);
          done();
        });
    });
  });

  describe('Update superpowers', () => {
    it ('[admin] should edit one superpower', (done) => {
      request(app)
        .put('/superpower/superpower')
        .send({name: 'superpower', description: 'superpower description'})
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
        .put('/superpower/superpower')
        .send({name: 'superpower', description: 'superpower description'})
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
        .put('/superpower/superpower')
        .send({name: 'superpower', description: 'superpower description'})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exists(res.body.err);
          done();
        });
    });
  });

  describe('Delete superpowers', () => {
    it ('[admin] should delete one superpower', (done) => {
      request(app)
        .delete('/superpower/superpower')
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
        .delete('/superpower/superpower')
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
        .delete('/superpower/superpower')
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