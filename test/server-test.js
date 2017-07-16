'use strict';

const path = require('path');

require('dotenv').config({path: `${__dirname}/../.test.env`});

const expect = require('expect');
const superagent = require('superagent');

require('./lib/mock-aws.js');
const server = require('../lib/server.js');

const API_URL = process.env.API_URL;

describe('testing server', () => {
  after(server.stop);
  describe('Testing Server', () => {
    it('should return 404 for non-existent route', () => {
      server.start();
      return superagent.get(`${API_URL}/api/not-a-route`)
        .then(res => {throw res;})
        .catch(res => {
          expect(res.status).toEqual(404);
          server.stop();
        });
    });
    it('should throw an error if server already down', (done) => {
      server.isOn = false;
      server.stop();
      done();
    });
    it('should throw an error if server already down', (done) => {
      server.isOn = true;
      server.start();
      done();
    });
  });
});

describe('testing error-handler 500 response', () => {
  before(server.start);
  after(server.stop);
  describe('Testing Error-Handler', () => {
    it('should return 500 for server error', (done) => {
      superagent.get(`${API_URL}/api/500test`)
        .end((err, res) => {
          expect(res.status).toEqual(500);
          done();
        });
    });
  });
});
