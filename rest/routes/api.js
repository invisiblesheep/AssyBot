
// Dependencies
var express = require('express');
var router = express.Router();


// Models
var User = require('../models/user');


// Routes
User.methods(['get','put','post','delete']);
User.register(router, '/user');

// Return Router
module.exports = router;
