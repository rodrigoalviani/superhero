'use strict';

module.exports = (app) => {

  const controllers = require('./controllers');

  // login
  app.post('/login', controllers.user.login);

  // user
  app.get('/user', controllers.user.auth, controllers.user.acl(['Admin']), controllers.user.list);
  app.post('/user', controllers.user.auth, controllers.user.acl(['Admin']), controllers.user.create);
  app.put('/user/:username', controllers.user.auth, controllers.user.acl(['Admin']), controllers.user.update);
  app.delete('/user/:username', controllers.user.auth, controllers.user.acl(['Admin']), controllers.user.delete);

  // superpower
  app.get('/superpower', controllers.user.auth, controllers.user.acl(['Standard', 'Admin']), controllers.superpower.list);
  app.get('/superpower/:name', controllers.user.auth, controllers.user.acl(['Standard', 'Admin']), controllers.superpower.view);
  app.post('/superpower', controllers.user.auth, controllers.user.acl(['Admin']), controllers.superpower.create);
  app.put('/superpower/:name', controllers.user.auth, controllers.user.acl(['Admin']), controllers.superpower.update);
  app.delete('/superpower/:name', controllers.user.auth, controllers.user.acl(['Admin']), controllers.superpower.delete);

  // superhero
  app.get('/superhero', controllers.user.auth, controllers.user.acl(['Standard', 'Admin']), controllers.superhero.list);
  app.get('/superhero/:name', controllers.user.auth, controllers.user.acl(['Standard', 'Admin']), controllers.superhero.view);
  app.post('/superhero', controllers.user.auth, controllers.user.acl(['Admin']), controllers.superhero.create);
  app.put('/superhero/:name', controllers.user.auth, controllers.user.acl(['Admin']), controllers.superhero.update);
  app.delete('/superhero/:name', controllers.user.auth, controllers.user.acl(['Admin']), controllers.superhero.delete);

  app.get('/helpme', controllers.user.auth, controllers.user.acl(['Standard', 'Admin']), controllers.helpme.search);
};