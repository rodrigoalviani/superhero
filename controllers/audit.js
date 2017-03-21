'use strict';

require('../models/audit');

const mongoose = require('mongoose');
const Audit = mongoose.model('Audit');
const jwt = require('jsonwebtoken');
const config = require('../config/config.json');

exports.log = (entity, entityId, username, action) => {
  let auditData = {
    entity: entity,
    entityId: entityId,
    datetime: new Date(),
    username: username,
    action: action
  };

  let audit = new Audit(auditData);

  audit.save((err) => {
    return true;
  });
};
