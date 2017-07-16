'use strict';

const faker = require('faker');
const Profile = require('../../model/profile.js');
const mockUser = require('./mock-user.js');
const mockProfile = module.exports = {};





mockProfile.createOne = () => {
  let result ={};
  return mockUser.createOne()
    .then(userData => {
      result = userData;
      return new Profile({
        address: 'address 12345',
        phone: '123456789',
        realName: 'mr real name',
        // picURI:
        userId: result.user._id,
      })
        .save();
    })
    .then(profile => {
      result.profile = profile;
      return result;
    });
};
