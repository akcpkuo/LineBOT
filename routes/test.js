var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  var headerString = JSON.stringify(req.headers);

  res.render('test', { headers: headerString });
});

module.exports = router;
