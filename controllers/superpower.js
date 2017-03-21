'use strict';

require('../models/superpower');
require('mongoose-query-paginate');

const mongoose = require('mongoose');
const SuperPower = mongoose.model('SuperPower');
const SuperHero = mongoose.model('SuperHero');
const audit = require('./audit');
const config = require('../config/config.json');

/**
 * @api {get} /superpower List
 * @apiSampleRequest off
 * @apiName getSuperPower
 * @apiGroup  SuperPower
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
 *       "total": 5,
 *       "pages": 1,
 *       "p": 1,
 *       "superpowers": [
 *         {
 *           "_id": "58d031f8fea5acf7252e2fd3",
 *           "name": "X-Ray Vision",
 *           "description": "The power to see through solid objects or people."
 *         }
 *       ]
 *     }
 */
exports.list = (req, res) => {
  let options = {
    perPage : 5,
    delta: 5,
    page: req.query.p || 1
  };

  let query = SuperPower.find({}, {"__v": 0});

  query.paginate(options, (err, ret) => {
    if (err) return res.status(500).json(err).end();

    let r = {
      total: ret.count,
      pages: ret.last,
      p: ret.current,
      superpowers: ret.results
    };

    return res.status(200).json(r).end();
  });
};

/**
 * @api {get} /superpower/:name View
 * @apiSampleRequest off
 * @apiName viewSuperPower
 * @apiGroup  SuperPower
 * @apiVersion  1.0.0
 *
 * @apiHeader {String}  Authorization A valid JWT
 *
 * @apiSuccess {String} Success
 * @apiSuccessExample {String} Success-Response
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "58d031f8fea5acf7252e2fd4",
 *       "name": "Telekinesis",
 *       "description": "The power to manipulate objects/matter with the mind."
 *     }
 */
exports.view = (req, res) => {
  let name = req.sanitize(req.params.name);

  if (!name) return res.status(400).json({err: 'all fields (name ) are required'}).end();

  SuperPower.findOne({name: name}, {"__v": 0}, (err, doc) => {
    if (err) return res.status(500).json({err: err.message}).end();
    if (!doc) return res.status(404).json({message: 'superpower not found'}).end();

    return res.status(200).json(doc).end();
  });
};

/**
 * @api {post} /superpower Create
 * @apiSampleRequest off
 * @apiName postSuperPower
 * @apiGroup  SuperPower
 * @apiVersion  1.0.0
 *
 * @apiHeader {String}  Authorization A valid JWT
 *
 * @apiParam  {String}  name  Name (unique)
 * @apiParam  {String}  description  Description
 *
 * @apiSuccess {String} Success
 * @apiSuccessExample {String} Success-Response
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "created"
 *     }
 */
exports.create = (req, res) => {
  let name = req.sanitize(req.body.name);
  let description = req.sanitize(req.body.description);

  if (!name || !description) return res.status(400).json({err: 'all fields (name and description) are required'}).end();

  SuperPower.findOne({name: name}, (err, has) => {
    if (err) return res.status(500).json({err: err.message}).end();
    if (has) return res.status(400).json({err: 'this superpower already exists'}).end();

    let Data = {
      name: name,
      description: description
    };

    let superpower = new SuperPower(Data);

    superpower.save((err, doc) => {
      if (err) return res.status(500).json({err: err.message}).end();
      audit.log('superpower', Data.name, res.locals.username, 'create');
      return res.status(201).json({message: 'created'}).end();
    });
  });
};

/**
 * @api {put} /superpower/:name Update
 * @apiSampleRequest off
 * @apiName putSuperPower
 * @apiGroup  SuperPower
 * @apiVersion  1.0.0
 *
 * @apiHeader {String}  Authorization A valid JWT
 *
 * @apiParam  {String}  name  Name (unique)
 * @apiParam  {String}  description  Description
 *
 * @apiSuccess {String} Success
 * @apiSuccessExample {String} Success-Response
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "updated"
 *     }
 */
exports.update = (req, res) => {
  let toUpdate = req.sanitize(req.params.name);
  let name = req.sanitize(req.body.name);
  let description = req.sanitize(req.body.description);

  if (!name || !description) return res.status(400).json({err: 'the fields (name and description) are required'}).end();

  SuperPower.findOne({name: toUpdate}, (err, doc) => {
    if (err) return res.status(500).json({err: err.message}).end();
    if (!doc) return res.status(400).json({err: 'this super power not exists'}).end();

    doc.name = name;
    doc.description = description;

    doc.save((err, doc) => {
      if (err) return res.status(500).json({err: err.message}).end();
      audit.log('superpower', toUpdate, res.locals.username, 'update');
      return res.status(200).json({message: 'updated'}).end();
    });
  });
};

/**
 * @api {delete} /superpower/:name Delete
 * @apiSampleRequest off
 * @apiName deleteSuperPower
 * @apiGroup  SuperPower
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
  let toDelete = req.sanitize(req.params.name);

  SuperPower.findOne({name: toDelete}, (err, doc) => {
    if (err) return res.status(500).json({err: err.message}).end();
    if (!doc) return res.status(404).json({err: 'superpower not found'}).end();

    SuperHero.find({superpowers: mongoose.Types.ObjectId(doc._id)}, (err, hero) => {
      if (err) return res.status(500).json({err: err.message}).end();
      if (hero.length) return res.status(400).json({err: 'cannot delete this super power while its related to a super hero'}).end();

      SuperPower.findOneAndRemove({name: toDelete}, (err, doc, r) => {
        if (err) return res.status(500).json({err: err.message}).end();
        audit.log('superpower', toDelete, res.locals.username, 'delete');
        return res.status(200).json({message: 'deleted'}).end();
      });
    });
  });
};