'use strict';

require('../models/user');
require('mongoose-query-paginate');

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Role = mongoose.model('Role');
const audit = require('./audit');
const util = require('./util');
const jwt = require('jsonwebtoken');
const async = require('async');
const config = require('../config/config.json');

/**
 * @api {post} /login Login
 * @apiSampleRequest off
 * @apiName postLogin
 * @apiGroup  User
 * @apiVersion  1.0.0
 *
 * @apiParam  {String}  username  Username
 * @apiParam  {String}  password  Password
 *
 * @apiSuccess {String} token JWT token
 * @apiSuccessExample {String} Success-Response
 *     HTTP/1.1 200 OK
 *     {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZXMiOlsiQWRtaW4iLCJTdGFuZGFyZCJdLCJpYXQiOjE0OTAwMzM4OTAsImV4cCI6MTQ5MDA2MjY5MH0.K5NrSEP-r6tMZ5k2li5G-9kl2k1MRWbCe_gsmE_fxjU"}
 */
exports.login = (req, res) => {
  let username = req.sanitize(req.body.username);
  let password = req.sanitize(req.body.password);

  if (!username || !password) return res.status(400).json({err: 'username and password must be sent'}).end();

  User
    .findOne({username: username}, (err, user) => {
      if (err) return res.status(500).json(err).end();

      if (!user) {
        return res.status(401).json({err: 'user not found'}).end();
      } else if (util.hashPassword(password) !== user.password) {
        return res.status(401).json({err: 'invalid password'}).end();
      } else {
        let token = jwt.sign({username: user.username, roles: user.roles}, config.salt, {expiresIn: '8h'});
        return res.status(200).json({token: token}).end();
      }
    });
};

exports.auth = (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(401).json({err: 'token not found'}).end();

  let token = req.headers.authorization.replace(/bearer /i, '');

  if (jwt.verify(token, config.salt, (err, decoded) => {
    if (err) return res.status(401).json({err: 'invalid token', token: decoded}).end();
    res.locals.username = decoded.username;
    res.locals.roles = decoded.roles;
    return next();
  }));
};

exports.acl = (roles) => {
  return (req, res, next) => {
    async.eachSeries(roles,
      (role, cb) => {
        if (res.locals.roles.indexOf(role) !== -1)
          return next();
        else
          return cb();
      },
      () => {
        return res.status(403).json({err: 'forbidden'}).end();
      }
    );
  };
};

/**
 * @api {get} /user List
 * @apiSampleRequest off
 * @apiName getUser
 * @apiGroup  User
 * @apiVersion  1.0.0
 *
 * @apiHeader {String}  Authorization A valid JWT
 *
 * @apiParam  {Number}  [p=1]  Page
 *
 * @apiSuccess {String} Success
 * @apiSuccessExample {String} Success-Response
 *     HTTP/1.1 200 OK
 *     {
 *      "total": 1,
 *      "pages": 1,
 *      "p": 1,
 *      "users": [
 *        {
 *          "_id": "58cfe4c3a661e1ea1fc2aedb",
 *          "username": "admin",
 *          "roles": [
 *            "Admin",
 *            "Standard"
 *          ]
 *        }
 *      ]
 *    }
 */
exports.list = (req, res) => {
  let options = {
    perPage : 5,
    delta: 5,
    page: req.query.p || 1
  };

  let query = User.find({}, {"password": 0, "__v": 0});

  query.paginate(options, (err, ret) => {
    if (err) return res.status(500).json(err).end();

    let r = {
      total: ret.count,
      pages: ret.last,
      p: ret.current,
      users: ret.results
    };

    return res.status(200).json(r).end();
  });
};

const validateRoles = (roles, callback) => {
  Role.find({}, {"_id": 0}).exec((err, role) => {
    let validRoles = [];
    let valid = [];

    async.filter(
      role,
      (r, cb) => {
        validRoles.push(r.name);
        cb();
      },
      (err) => {
        async.filter(roles,
          (r, cb) => {
            if (validRoles.indexOf(r) !== -1) valid.push(r);
            cb();
          }, (err) => { callback(err, valid); }
        );
      }
    );
  });
};

/**
 * @api {post} /user Create
 * @apiSampleRequest off
 * @apiName postUser
 * @apiGroup  User
 * @apiVersion  1.0.0
 *
 * @apiHeader {String}  Authorization A valid JWT
 *
 * @apiParam  {String}  username  Username (unique)
 * @apiParam  {String}  password  Password
 * @apiParam  {Array=[Admin, Standard]}   roles     Roles
 *
 * @apiSuccess {String} Success
 * @apiSuccessExample {String} Success-Response
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "created"
 *     }
 */
exports.create = (req, res) => {
  let username = req.sanitize(req.body.username);
  let password = req.sanitize(req.body.password);
  let roles = req.body.roles;

  if (!username || !password || !roles) return res.status(400).json({err: 'all fields (username, password and roles) are required'}).end();

  validateRoles(roles, (err, validRoles) => {

    if (!validRoles.length) return res.status(400).json({err: 'invalid role'}).end();

    User.findOne({username: username}, (err, hasUser) => {
      if (err) return res.status(500).json({err: err.message}).end();
      if (hasUser) return res.status(400).json({err: 'this user already exists'}).end();

      let userData = {
        username: username,
        password: password,
        roles: validRoles
      };

      let user = new User(userData);

      user.save((err, doc) => {
        if (err) return res.status(500).json({err: err.message}).end();
        audit.log('user', userData.username, res.locals.username, 'create');
        return res.status(201).json({message: 'created'}).end();
      });
    });
  });
};

/**
 * @api {put} /user/:username Update
 * @apiSampleRequest off
 * @apiName putUser
 * @apiGroup  User
 * @apiVersion  1.0.0
 *
 * @apiHeader {String}  Authorization A valid JWT
 *
 * @apiParam  {String}  username  Username (unique)
 * @apiParam  {String}  [password]  Password
 * @apiParam  {Array=[Admin, Standard]}   roles     Roles
 *
 * @apiSuccess {String} Success
 * @apiSuccessExample {String} Success-Response
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "updated"
 *     }
 */
exports.update = (req, res) => {
  let userToUpdate = req.sanitize(req.params.username);
  let username = req.sanitize(req.body.username);
  let password = req.sanitize(req.body.password);
  let roles = req.body.roles;

  if (!username || !roles) return res.status(400).json({err: 'the fields (username and roles) are required'}).end();

  validateRoles(roles, (err, validRoles) => {
    if (!validRoles.length) return res.status(400).json({err: 'invalid role'}).end();

    User.findOne({username: userToUpdate}, (err, userData) => {
      if (err) return res.status(500).json({err: err.message}).end();
      if (!userData) return res.status(400).json({err: 'this user not exists'}).end();

      userData.username = username;
      userData.roles = validRoles;

      if (password) userData.password = password;

      userData.save((err, doc) => {
        if (err) return res.status(500).json({err: err.message}).end();
        audit.log('user', userToUpdate, res.locals.username, 'update');
        return res.status(200).json({message: 'updated'}).end();
      });
    });
  });
};

/**
 * @api {delete} /user/:username Delete
 * @apiSampleRequest off
 * @apiName deleteUser
 * @apiGroup  User
 * @apiVersion  1.0.0
 *
 * @apiHeader {String}  Authorization A valid JWT
 *
 * @apiSuccess {String} Success
 * @apiSuccessExample {String} Success-Response
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "deleted"
 *     }
 */
exports.delete = (req, res) => {
  let userToDelete = req.sanitize(req.params.username);

  User.findOneAndRemove({username: userToDelete}, (err, doc, r) => {
    if (err) return res.status(500).json({err: err.message}).end();
    if (!doc) return res.status(404).json({err: 'username not found'}).end();
    audit.log('user', userToDelete, res.locals.username, 'delete');
    return res.status(200).json({message: 'deleted'}).end();
  });
};