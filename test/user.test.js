'use strict';

process.env.NODE_ENV = 'test';

const app = require('../index');
const request = require('supertest');
const should = require('should');
const config = require('../config/config.json');
const helper = require('./helper');

let tokenAdmin = '';
let tokenStandard = '';

describe('Users', () => {
  before(helper.createRole);
  before(helper.createAdmin);
  before(helper.createStandard);

  describe('Login', () => {
    it('[admin] should return a token', (done) => {
      request(app)
        .post('/login')
        .send({username: 'admin', password: 'change123'})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.token);
          tokenAdmin = res.body.token;
          done();
        });
    });

    it('[standard] should return a token', (done) => {
      request(app)
        .post('/login')
        .send({username: 'standard', password: 'change123'})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.token);
          tokenStandard = res.body.token;
          done();
        });
    });

    it('[none] should return a error', (done) => {
      request(app)
        .post('/login')
        .send({username: 'asd', password: 'asd'})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exist(res.body.err);
          should.not.exist(res.body.token);
          done();
        });
    });
  });

  describe('List users', () => {
    it ('[admin] should list two users', (done) => {
      request(app)
        .get('/user')
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 200);
          should.exist(res.body.total);
          should.equal(res.body.total, 2);
          done();
        });
    });

    it ('[standard] should not list users', (done) => {
      request(app)
        .get('/user')
        .set({Authorization: tokenStandard})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 403);
          should.exist(res.body.err);
          done();
        });
    });

    it ('[none] should return unauthorized', (done) => {
      request(app)
        .get('/user')
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exist(res.body.err);
          done();
        });
    });
  });


  describe('Create users', () => {
    it ('[admin] should create one "admin" user', (done) => {
      request(app)
        .post('/user')
        .send({username: 'adminUser', password: 'pass123', roles: ['Admin']})
        .set({Authorization: tokenAdmin})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 201);
          should.exists(res.body.message);
          done();
        });
    });

    it ('[admin] should create one "standard" user', (done) => {
      request(app)
        .post('/user')
        .send({username: 'standardUser', password: 'pass123', roles: ['Standard']})
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
        .post('/user')
        .send({username: 'standardUser', password: 'pass123', roles: ['Standard']})
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
        .post('/user')
        .send({username: 'standardUser', password: 'pass123', roles: ['Standard']})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exists(res.body.err);
          done();
        });
    });
  });

  describe('Update users', () => {
    it ('[admin] should edit one user', (done) => {
      request(app)
        .put('/user/standardUser')
        .send({username: 'standardUser', password: 'pass1234', roles: ['Standard']})
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
        .put('/user/standardUser')
        .send({username: 'standardUser', password: 'pass123', roles: ['Standard']})
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
        .put('/user/standardUser')
        .send({username: 'standardUser', password: 'pass123', roles: ['Standard']})
        .end((err, res) => {
          should.not.exist(err);
          should.equal(res.status, 401);
          should.exists(res.body.err);
          done();
        });
    });
  });

  describe('Delete users', () => {
    it ('[admin] should delete one user', (done) => {
      request(app)
        .delete('/user/standardUser')
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
        .delete('/user/standardUser')
        .send({username: 'standardUser', password: 'pass123', roles: ['Standard']})
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
        .delete('/user/standardUser')
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