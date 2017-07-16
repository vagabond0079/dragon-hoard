'use strict';

const path = require('path');

require('dotenv').config({path: `${__dirname}/../.test.env`});

const expect = require('expect');
const superagent = require('superagent');

require('./lib/mock-aws.js');
const User = require('../model/user.js');
const server = require('../lib/server.js');
const clearDB = require('./lib/clear-db.js');
const mockUser = require('./lib/mock-user.js');
const mockTool = require('./lib/mock-tool.js');

const API_URL = process.env.API_URL;

describe('Testing Tool model', () => {
  let tempUserData;

  before(server.start);
  after(server.stop);
  beforeEach('create mockTool', () => {
    return mockTool.createOne()
      .then(userData => {
        tempUserData = userData;
      });
  });
  afterEach(clearDB);

  describe('Testing POST', () => {
    it('should return a tool and a 200 status', () => {
      return superagent.post(`${API_URL}/api/tools`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .field('ownerId', 'not-an-id')
        .field('serialNumber', 67890)
        .field('toolName', 'test-tool-2')
        .field('toolDescription', 'description-of-test-tool-2')
        .field('toolInstructions', 'instructions-for-test-tool-2')
        .field('category', 'auto')
        .attach('image', `${__dirname}/test-assets/thor-hammer.jpeg`)
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.body.ownerId).toEqual(tempUserData.user._id.toString());
          expect(res.body.serialNumber).toEqual(67890);
          expect(res.body.toolName).toEqual('test-tool-2');
          expect(res.body.toolDescription).toEqual('description-of-test-tool-2');
          expect(res.body.toolInstructions).toEqual('instructions-for-test-tool-2');
          expect(res.body.category).toEqual('auto');
          expect(res.body.picURI).toExist();
        });
    });
    it('should respond with a 400 status for an improperly formatted attach', () => {
      return superagent.post(`${API_URL}/api/tools`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .field('ownerId', 'not-an-id')
        .field('serialNumber', 67890)
        .field('toolName', 'test-tool-2')
        .field('toolDescription', 'description-of-test-tool-2')
        .field('toolInstructions', 'instructions-for-test-tool-2')
        .field('category', 'auto')
        .attach('', `${__dirname}/test-assets/thor-hammer.jpeg`)
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });
    it('should respond with a 400 if no body provided', () => {
      return superagent.post(`${API_URL}/api/tools`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .send({})
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });
    it('should respond with a 400 if invalid body', () => {
      return superagent.post(`${API_URL}/api/tools`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .send({
          ownerId: 'not-an-id',
          serialNumber: 67890,
          toolName: 'test-tool-2',
          toolDescription: 'description-of-test-tool-2',
          toolInstructions: 'instructions-for-test-tool-2',
          category: 'auto',
        })
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });
  });
  describe('Testing GET /api/tools', () => {
    it('should return a tool and a 200 status', () => {
      return superagent.get(`${API_URL}/api/tools/${tempUserData.tool._id}`)
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.body.ownerId).toEqual(tempUserData.user._id.toString());
          expect(res.body.serialNumber).toEqual(tempUserData.tool.serialNumber);
          expect(res.body.toolName).toEqual(tempUserData.tool.toolName);
          expect(res.body.toolDescription).toEqual(tempUserData.tool.toolDescription);
          expect(res.body.toolInstructions).toEqual(tempUserData.tool.toolInstructions);
          expect(res.body.category).toEqual(tempUserData.tool.category);
        });
    });
    it('should respond with status 404 for tool.id not found', () => {
      return superagent.get(`${API_URL}/api/tools/not-an-id`)
        .catch(res => {
          expect(res.status).toEqual(404);
        });
    });
  });
  describe('Testing PUT', () => {
    it('should return an updated tool and a 200 status', () => {
      return superagent.put(`${API_URL}/api/tools/${tempUserData.tool._id}`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .send({
          toolDescription: 'updated-description',
        })
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.body.toolDescription).toEqual('updated-description');
        });
    });
    it('should respond with a 400 if no body provided', () => {
      return superagent.put(`${API_URL}/api/tools/${tempUserData.tool._id}`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .send({})
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });
    it('should respond with a 401 because user cannot update another users  tool', () => {
      return mockUser.createOne()
        .then(userData => {
          return userData;
        })
        .then(userData => {
          let putTestUserData = userData;
          return superagent.put(`${API_URL}/api/tools/${tempUserData.tool._id}`)
            .set('Authorization', `Bearer ${putTestUserData.token}`)
            .send({
              toolDescription: 'updated-description',
            })
            .catch(res => {
              expect(res.status).toEqual(401);
            });
        });
    });
    it('should respond with a 401 if no token provided', () => {
      return superagent.put(`${API_URL}/api/tools/${tempUserData.tool._id}`)
        .set('Authorization', `Bearer `)
        .send({})
        .catch(res => {
          expect(res.status).toEqual(401);
        });
    });
    it('should respond with a 400 if invalid body', () => {
      return superagent.put(`${API_URL}/api/tools/${tempUserData.tool._id}`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .send({
          serialNumber: 'not-a-number',
        })
        .then(res => {
          throw res;})
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });
    it('should respond with status 404 for tool.id not found', () => {
      return superagent.put(`${API_URL}/api/tools/not-an-id`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .send({
          serialNumber: 54321,
        })
        .then(res => {throw res;})
        .catch(res => {
          expect(res.status).toEqual(404);
        });
    });
    it('should respond with status 401 for user not found', () => {
      //unreturned promise below is intentional to spoof 'no user found' without triggering 'no token'.
      superagent.put(`${API_URL}/api/tools/${tempUserData.tool._id}`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .then(res => {throw res;})
        .catch(res => {
          expect(res.status).toEqual(401);
          expect(err.message).toEqual('unauthorized no user found');
        });
    });
  });
  describe('Testing DELETE /api/tools', () => {
    it('should delete a tool and respond with a 204 status', () => {
      return superagent.delete(`${API_URL}/api/tools/${tempUserData.tool._id}`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .then(res => {throw res;})
        .catch(res => {
          expect(res.status).toEqual(204);
        });
    });
    it('should respond with a 401 because user cannot delete another users tool', () => {
      return mockUser.createOne()
        .then(userData => {
          return userData;
        })
        .then(userData => {
          let deleteTestUserData = userData;
          return superagent.delete(`${API_URL}/api/tools/${tempUserData.tool._id}`)
            .set('Authorization', `Bearer ${deleteTestUserData.token}`)
            .then(res => {throw res;})
            .catch(res => {
              expect(res.status).toEqual(401);
            });
        });
    });
    it('should respond with status 404 for tool.id not found', () => {
      return superagent.delete(`${API_URL}/api/tools/not-an-id`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .catch(res => {
          expect(res.status).toEqual(404);
        });
    });
  });
}); // close final describe block
