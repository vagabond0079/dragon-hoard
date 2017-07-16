'use strict';

const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  borrowerId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user'},
  toolId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'tool'},
  startDate: {type: Date, required: true},
  endDate: {type: Date, required: true},
  transactionDate: {type: Date, default: Date.now()},
});

module.exports = mongoose.model('transaction', transactionSchema);
