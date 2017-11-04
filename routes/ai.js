const Clarifai = require('clarifai');
const express = require('express');
const nconf = require('nconf');

const CLARIFAI_API = nconf.get('CLARIFAI_API');

// var app = new Clarifai.app({
//   apiKey: CLARIFAI_API
// });

var router = express.Router({
  mergeParams: true
});

router.route('/')
  .get(function (req, res) {

  });

module.exports = router;
