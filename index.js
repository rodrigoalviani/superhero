'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config.json');

let port = process.env.PORT || config.port;
let env = process.env.NODE_ENV || config.env;

let app = express();

app.use(cors({ exposedHeaders: config.corsHeaders }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressSanitizer());

require('./models');
require('./routes')(app);

const dbConfig = require('./config/database')[env];
mongoose.connect(dbConfig.url, dbConfig.options);
mongoose.Promise = global.Promise;

app.use((req, res, next) => {
  console.log(req);
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

app.listen(port, console.log('Listening on port ' + port));

exports = module.exports = app;