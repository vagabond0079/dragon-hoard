'use strict';

const mongoose = require('mongoose');

const toolSchema = mongoose.Schema({
  ownerId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user'},
  serialNumber: {type: Number},
  toolName: {type: String, required: true},
  toolDescription: {type: String, required: true},
  toolInstructions: {type: String},
  picURI: {type: String},
  category: {type: String, required: true},
  isCheckedOut: {type: Boolean, default: false},
});

module.exports = mongoose.model('tool', toolSchema);
