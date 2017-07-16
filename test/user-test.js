'use strict';

const path = require('path');

require('dotenv').config({path: `${__dirname}/../.test.env`});

const expect = require('expect');
const superagent = require('superagent');
const server = require('../lib/server.js');

require('./lib/mock-aws.js');
const clearDB = require('./lib/clear-db.js');
const mockUser = require('./lib/mock-user.js');

const API_URL = process.env.API_URL;

describe('Testing User model', () => {

  before(server.start);
  after(server.stop);
  afterEach(clearDB);

  let data = {
    username: 'test-user',
    password: 'secret',
    email: 'test@email.com',
  };

  describe('Testing POST', () => {
    it('should return a token and a 200 status', () => {
      return superagent.post(`${API_URL}/api/signup`)
        .send(data)
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.text).toExist();
          expect(res.text.length > 1).toBeTruthy();
        });
    });
    it('should respond with a 400 if no body provided', () => {
      return superagent.post(`${API_URL}/api/signup`)
        .send({})
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });
    it('should respond with a 400 if invalid body', () => {
      return superagent.post(`${API_URL}/api/signup`)
        .send({
          username: '',
          email: '',
          password: '',
        })
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });
    it('should respond with a 409 if username already exists', () => {
      return mockUser.createOne()
        .then(userData => {
          return userData.user.save();
        })
        .then(user => {
          let tempUser = user;
          return superagent.post(`${API_URL}/api/signup`)
            .send({
              username: tempUser.username,
              password: 'secret2',
              email: 'test2@email.com',
            });
        })
        .then(res => {throw res;})
        .catch(err => {
          expect(err.response.status).toEqual(409);
        });
    });
  });
  describe('Testing GET /api/signin', () => {
    it('should return a token and a 200 status', () => {
      let tempUser;
      return mockUser.createOne()
        .then(userData => {
          tempUser = userData.user;
          let encoded = new Buffer(`${tempUser.username}:${userData.password}`).toString('base64');
          return superagent.get(`${API_URL}/api/signin`).set('Authorization', `Basic ${encoded}`);
        })
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.text).toExist();
          expect(res.text.length > 1).toBeTruthy();
        });
    });
    it('should return 401 status for incorrect password', () => {
      let tempUser;
      return mockUser.createOne()
        .then(userData => {
          tempUser = userData.user;
          let encoded = new Buffer(`${tempUser.username}:'not-a-password'`).toString('base64');
          return superagent.get(`${API_URL}/api/signin`).set('Authorization', `Basic ${encoded}`);
        })
        .catch(res => {
          expect(res.status).toEqual(401);
        });
    });
    it('should respond with a status 401 for improperly formatted request', () => {
      let tempUser;
      return mockUser.createOne()
        .then(userData => {
          tempUser = userData.user;
          let encoded = new Buffer(`${tempUser.username}:${userData.password}`).toString('base64');
          return superagent.get(`${API_URL}/api/signin`);
        })
        .catch(res => {
          expect(res.status).toEqual(401);
        });
    });
    it('should respond with 401 status for no Basic Auth', () => {
      let tempUser;
      return mockUser.createOne()
        .then(userData => {
          tempUser = userData.user;
          let encoded = new Buffer(`${tempUser.username}:${userData.password}`).toString('base64');
          return superagent.get(`${API_URL}/api/signin`).set('Authorization', `Basic`);
        })
        .catch(res => {
          expect(res.status).toEqual(401);
        });
    });
    it('should respond with 401 status for no password or username', () => {
      let tempUser;
      return mockUser.createOne()
        .then(userData => {
          tempUser = userData.user;
          let encoded = new Buffer(`${userData.password}`).toString('base64');
          return superagent.get(`${API_URL}/api/signin`).set('Authorization', `Basic ${encoded}`);
        })
        .catch(res => {
          expect(res.status).toEqual(401);
        });
    });
    it('should respond with 401 status for username not found', () => {
      let tempUser;
      return mockUser.createOne()
        .then(userData => {
          tempUser = userData.user;
          let encoded = new Buffer(`not-a-username:${userData.password}`).toString('base64');
          return superagent.get(`${API_URL}/api/signin`).set('Authorization', `Basic ${encoded}`);
        })
        .catch(res => {
          expect(res.status).toEqual(401);
        });
    });
  });
}); // close final describe block
