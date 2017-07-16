'use strict';

const faker = require('faker');
const mockUser = require('./mock-user.js');
const mockTool = require('./mock-tool.js');
const Transaction = require('../../model/transaction.js');

const mockTransaction = module.exports = {};

mockTransaction.createOne = () => {
  let result = {};
  return mockUser.createOne()
    .then(borrowerData => {
      result.borrower = borrowerData.user;
      result.token = borrowerData.token;
      result.password = borrowerData.password;
      return mockTool.createOne()
        .then(toolData => {
          result.tool = toolData.tool;
          return new Transaction({
            borrowerId: result.borrower._id,
            toolId: result.tool._id,
            startDate: Date.now(),
            endDate: Date.now(),
            transactionDate: Date.now(),
          })
            .save();
        })
        .then(transaction => {
          result.transaction = transaction;
          return result;
        });
    });
};
