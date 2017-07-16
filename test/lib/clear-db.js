'use strict';

const User = require('../../model/user.js');
const Transaction = require('../../model/transaction.js');
const Tool = require('../../model/tool.js');
const Profile = require('../../model/profile.js');

module.exports = () => {
  return Promise.all([
    User.remove({}),
    Transaction.remove({}),
    Tool.remove({}),
    Profile.remove({}),
  ]);
};
