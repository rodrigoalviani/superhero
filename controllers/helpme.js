'use strict';

require('../models/protectionarea');

const mongoose = require('mongoose');
const ProtectionArea = mongoose.model('ProtectionArea');
const SuperHero = mongoose.model('SuperHero');
const config = require('../config/config.json');

/**
 * @api {get} /helpme Search
 * @apiSampleRequest off
 * @apiName getHelpMe
 * @apiGroup  HelpMe
 * @apiVersion  1.0.0
 *
 * @apiHeader {String}  Authorization A valid JWT
 *
 * @apiParam  {Float}  lat  Latitude
 * @apiParam  {Float}  lng  Longitude
 *
 * @apiSuccess {String} Success
 * @apiSuccessExample {String} Success-Response
 *     HTTP/1.1 200 OK
 *     {
 *       "heroes": [
 *         {
 *           "_id": "58d144ec6005fd1accc360ef",
 *           "name": "Superman",
 *           "alias": "Clark Kent",
 *           "protectionarea": {
 *             "_id": "58d144e056fe891ac330d850",
 *             "name": "New York",
 *             "loc": [
 *               -73.935242,
 *               40.73061
 *             ],
 *             "radius": 50
 *           },
 *           "superpowers": [
 *             {
 *               "_id": "58d144e7e20e5b1ac88e0f50",
 *               "name": "Telekinesis",
 *               "description": "Super Power."
 *             }
 *           ]
 *         }
 *     }
 */
exports.search = (req, res) => {
  let lng = req.sanitize(req.query.lng);
  let lat = req.sanitize(req.query.lat);
  let protectionAreas = [];
  let radius = 10;

  if (!lng || !lat) return res.status(400).json({err: 'all fields (lng and lat) are required'}).end();

  ProtectionArea
    .geoNear([parseFloat(lng), parseFloat(lat)], { maxDistance : radius/6371, spherical : true }, (err, doc) => {
      if (err) return res.status(500).json(err).end();
      if (!doc.length) return res.status(404).json({err: 'no heroes near you... sorry :('}).end();

      doc.map(p => {
        protectionAreas.push(p.obj._id);
      });

      SuperHero.find({protectionarea: {$in: protectionAreas}}).populate('protectionarea').populate('superpowers').exec((err, heroes) => {
        return res.status(200).json({'heroes': heroes}).end();
      });
  });
};
