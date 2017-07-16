'use strict';

const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
  address: {type: String, required: true},
  phone: {type: String, required: true},
  realName: {type: String, required: true},
  picURI: {type: String},
  userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user'},
});

module.exports = mongoose.model('profile', profileSchema);
