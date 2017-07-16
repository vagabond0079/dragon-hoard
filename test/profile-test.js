'use strict';

const path = require('path');

require('dotenv').config({path: `${__dirname}/../.test.env`});

const expect = require('expect');
const superagent = require('superagent');

require('./lib/mock-aws.js');
const server = require('../lib/server.js');
const clearDB = require('./lib/clear-db.js');
const mockUser = require('./lib/mock-user.js');
const mockProfile = require('./lib/mock-profile.js');

const API_URL = process.env.API_URL;

describe('Testing Profile Model', () =>{
  let tempUserData;
  before(server.start);
  after(server.stop);
  beforeEach('create mockProfile', () =>{
    return mockProfile.createOne()
      .then(userData => {
        tempUserData = userData;
      });
  });
  afterEach(clearDB);
  // afterEach(tempUserData = {});

  describe('Testing POST', () => {
    it('should return a 200 status and a profile', () =>{
      return superagent.post(`${API_URL}/api/profile`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .field('address', '6208 57th ave south seattle WA 98118')
        .field('phone', '253-397-8733')
        .field('realName', 'Saul Greene')
        .attach('image', `${__dirname}/test-assets/thor-hammer.jpeg`)
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.body.address).toEqual('6208 57th ave south seattle WA 98118');
          expect(res.body.phone).toEqual('253-397-8733');
          expect(res.body.realName).toEqual('Saul Greene');
          expect(res.body.picURI).toExist();
          expect(res.body.userId).toEqual(tempUserData.user._id);
          expect(res.text.length > 1).toBeTruthy();
        });
    });
    it('should return a 400 status Bad Request', () =>{
      return superagent.post(`${API_URL}/api/profile/`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .send({})
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });
  });//end of POST describe block
  describe('Testing GET', () => {
    it('should return a status 200 and a retrieved profile', () => {
      return superagent.get(`${API_URL}/api/profile/${tempUserData.user._id}`)
        .then(res => {
          expect(res.status).toEqual(200);
        });
    });
    it('should return a status 404', () => {
      return superagent.get(`${API_URL}/api/profile/67383`)
        .catch(res => {
          expect(res.status).toEqual(404);
        });
    });
  });//end of GET describe block

  describe('Testing DELETE', () => {
    it('should delete a profile and return status 204', () => {
      return superagent.delete(`${API_URL}/api/profile/${tempUserData.profile._id}`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .then( res => {
          expect(res.status).toEqual(204);
        });
    });
    it('should return status 404', () => {
      return superagent.delete(`${API_URL}/api/profile/69843`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .catch( res => {
          expect(res.status).toEqual(404);
        });
    });
    it('should return status 401', () => {
      return superagent.delete(`${API_URL}/api/profile/${tempUserData.profile._id}`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .catch( res => {
          expect(res.status).toEqual(401);
        });
    });
    it('should return status 401 because user does not have permission to delete another users profile', () => {
      return mockUser.createOne()
        .then(userData => {
          return userData;
        })
        .then(userData => {
          let deleteTestUserData = userData;
          return superagent.delete(`${API_URL}/api/profile/${tempUserData.profile._id}`)
            .set('Authorization', `Bearer ${deleteTestUserData.token}`)
            .catch( res => {
              expect(res.status).toEqual(401);
            });
        });
    });
  });//end of DELETE describe block

  describe('Testing PUT', () => {
    it('should respond with a 200 and modify the selected profile', () => {
      return superagent.put(`${API_URL}/api/profile/${tempUserData.profile._id}`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .send({
          realName: 'Josh Farber',
        })
        .then(res =>{
          expect(res.status).toEqual(200);
        });
    });
    it('should respond with a 200 and modify the selected profile', () => {
      return mockUser.createOne()
        .then(userData => {
          return userData;
        })
        .then(userData => {
          let putTestUserData = userData;
          return superagent.put(`${API_URL}/api/profile/${tempUserData.profile._id}`)
            .set('Authorization', `Bearer ${putTestUserData.token}`)
            .send({
              realName: 'Josh Farber',
            })
            .catch(res =>{
              expect(res.status).toEqual(401);
            });
        });
    });
    it('should respond with a status 400 Bad request', () => {
      return superagent.put(`${API_URL}/api/profile/${tempUserData.profile._id}`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .send({})
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });
    it('should respond with a status 404 Not Found', () => {
      return superagent.put(`${API_URL}/api/profile/75493`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .catch(res => {
          expect(res.status).toEqual(404);
        });
    });
    it('should respond with a status 401 Unauthorized', () => {
      return superagent.put(`${API_URL}/api/profile/${tempUserData.profile._id}`)
        .send({})
        .catch(res => {
          expect(res.status).toEqual(401);
        });
    });
  });//end of PUT describe block

}); //end of describe block
