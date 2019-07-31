
// Dependencies
const restful = require('node-restful');

const { mongoose } = restful;

// Schema
const userSchema = new mongoose.Schema({
  id: String,
  location: Array,
  logo: { type: Array },
  type: { type: String },
  tags: Array,
  activity: Boolean,
  timestamp: Date,
});

// Return model
module.exports = restful.model('Users', userSchema);
