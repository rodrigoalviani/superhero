'use strict';

require('../models/superpower');
require('mongoose-query-paginate');

const mongoose = require('mongoose');
const SuperHero = mongoose.model('SuperHero');
const SuperPower = mongoose.model('SuperPower');
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
 *       "total": 1,
 *       "pages": 1,
 *       "p": 1,
 *       "superheros": [
 *         {
 *           "_id": "58d083af3980679f1929b1c7",
 *           "name": "Traveler Hero",
 *           "alias": "Mr Traveler",
 *           "protectionarea": {
 *             "_id": "58d138a1383ace186c65f533",
 *             "name": "New York",
 *             "loc": [
 *               -73.935242,
 *               40.73061
 *             ],
 *             "radius": 50
 *           },
 *           "superpowers": [
 *             {
 *               "_id": "58d07ef52bcaab9b5bade4f0",
 *               "name": "Dimensional Travel",
 *               "description": "The power to travel between different dimensions. "
 *             }
 *           ]
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

  let query = SuperHero.find({}, {"__v": 0}).populate('superpowers').populate('protectionarea');

  query.paginate(options, (err, ret) => {
    if (err) return res.status(500).json(err).end();

    let r = {
      total: ret.count,
      pages: ret.last,
      p: ret.current,
      superheros: ret.results
    };

    return res.status(200).json(r).end();
  });
};

/**
 * @api {get} /superhero/:name View
 * @apiSampleRequest off
 * @apiName viewSuperHero
 * @apiGroup  SuperHero
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

  SuperHero.findOne({name: name}, {"__v": 0}).populate('superpowers').populate('protectionarea').exec((err, doc) => {
    if (err) return res.status(500).json({err: err.message}).end();
    if (!doc) return res.status(404).json({message: 'superhero not found'}).end();

    return res.status(200).json(doc).end();
  });
};

/**
 * @api {post} /superhero Create
 * @apiSampleRequest off
 * @apiName postSuperHero
 * @apiGroup  SuperHero
 * @apiVersion  1.0.0
 *
 * @apiHeader {String}  Authorization A valid JWT
 *
 * @apiParam  {String}  name  Name (unique)
 * @apiParam  {String}  alias  Alias
 * @apiParam  {String}  protectionarea  ProtectionArea ID
 * @apiParam  {Array} superpowers SuperPowers IDs
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
  let alias = req.sanitize(req.body.alias);
  let protectionarea = req.sanitize(req.body.protectionarea);
  let superpowers = req.body.superpowers;

  if (!name || !alias || !protectionarea || !superpowers)
    return res.status(400).json({err: 'all fields (name, alias, protectionarea and superpowers) are required'}).end();

  SuperHero.findOne({name: name}, (err, has) => {
    if (err) return res.status(500).json({err: err.message}).end();
    if (has) return res.status(400).json({err: 'this superhero already exists'}).end();

    let Data = {
      name: name,
      alias: alias,
      protectionarea: protectionarea,
      superpowers: superpowers
    };

    let superhero = new SuperHero(Data);

    superhero.save((err, doc) => {
      if (err) return res.status(500).json({err: err.message}).end();
      audit.log('superhero', Data.name, res.locals.username, 'create');
      return res.status(201).json({message: 'created'}).end();
    });
  });
};

/**
 * @api {put} /superhero/:name Update
 * @apiSampleRequest off
 * @apiName putSuperHero
 * @apiGroup  SuperHero
 * @apiVersion  1.0.0
 *
 * @apiHeader {String}  Authorization A valid JWT
 *
 * @apiParam  {String}  name  Name (unique)
 * @apiParam  {String}  alias  Alias
 * @apiParam  {String}  protectionarea  ProtectionArea ID
 * @apiParam  {Array} superpowers SuperPowers IDs
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
  let alias = req.sanitize(req.body.alias);
  let protectionarea = req.sanitize(req.body.protectionarea);
  let superpowers = req.body.superpowers;

  if (!name || !alias) return res.status(400).json({err: 'all fields (name, alias, protectionarea and superpowers) are required'}).end();

  SuperHero.findOne({name: toUpdate}, (err, doc) => {
    if (err) return res.status(500).json({err: err.message}).end();
    if (!doc) return res.status(400).json({err: 'this superhero not exists'}).end();

    doc.name = name;
    doc.alias = alias;
    doc.protectionarea = protectionarea;
    doc.superpowers = superpowers;

    doc.save((err, doc) => {
      if (err) return res.status(500).json({err: err.message}).end();
      audit.log('superhero', toUpdate, res.locals.username, 'update');
      return res.status(200).json({message: 'updated'}).end();
    });
  });
};

/**
 * @api {delete} /superhero/:name Delete
 * @apiSampleRequest off
 * @apiName deleteSuperHero
 * @apiGroup  SuperHero
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

  SuperHero.findOneAndRemove({name: toDelete}, (err, doc, r) => {
    if (err) return res.status(500).json({err: err.message}).end();
    if (!doc) return res.status(404).json({err: 'superhero not found'}).end();
    audit.log('superhero', toDelete, res.locals.username, 'delete');
    return res.status(200).json({message: 'deleted'}).end();
  });
};