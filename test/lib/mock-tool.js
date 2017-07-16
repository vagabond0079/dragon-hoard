'use strict';

const faker = require('faker');
const Tool = require('../../model/tool.js');
const mockUser = require('./mock-user.js');

const mockTool = module.exports = {};

mockTool.createOne = () => {
  let result = {};
  return mockUser.createOne()
    .then(userData => {
      result = userData;
      return new Tool({
        ownerId: result.user._id,
        serialNumber: 12345,
        toolName: 'test-tool',
        toolDescription: 'description-of-test-tool',
        toolInstructions: 'instructions-for-test-tool',
        // picURI: {type: String},
        category: 'garden',
      })
        .save();
    })
    .then(tool => {
      result.tool = tool;
      return result;
    });
};
