var express = require('express');
var router = express.Router();

module.exports = (db) => {
  router.get('/', function(req, res, next) {
    res.render('login', { title: 'Express' });
  });
  
  return router;
}
