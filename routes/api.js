
// Dependencies
const express = require('express');

const router = express.Router();


// Models
const User = require('../models/user');


// Routes
User.methods(['get', 'put', 'post', 'delete']);
User.register(router, '/user');

// Return Router
module.exports = router;
