
const path = require('path');

require('dotenv').config({path: `${__dirname}/../.test.env`});

const expect = require('expect');
const superagent = require('superagent');

require('./lib/mock-aws.js');
const server = require('../lib/server.js');
const clearDB = require('./lib/clear-db.js');
const mockUser = require('./lib/mock-user.js');
const mockTransaction = require('./lib/mock-transaction.js');

const API_URL = process.env.API_URL;

describe('Testing Transaction router', () => {

  let tempUserData;

  before(server.start);
  after(server.stop);
  beforeEach('create mockTransaction', () => {
    return mockTransaction.createOne()
      .then(transactionData => {
        tempUserData = transactionData;
      });
  });
  afterEach(clearDB);


  describe('Testing POST', () => {
    it('should return a transaction and a 200 status', () => {
      return superagent.post(`${API_URL}/api/transactions`)
        .send({
          borrowerId: tempUserData.borrower._id,
          toolId: tempUserData.tool._id,
          startDate: Date.now(),
          endDate: Date.now(),
          transactionDate: Date.now(),
        })
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.body.borrowerId).toEqual(tempUserData.borrower._id);
          expect(res.body.toolId).toEqual(tempUserData.tool._id);
          expect(res.body.startDate).toExist();
          expect(res.body.endDate).toExist();
          expect(res.body.transactionDate).toExist();
        });
    });
    it('should respod with a 400 status', () => {
      return superagent.post(`${API_URL}/api/transactions`)
        .send({
          borrowerId: '29vmango37dkd27jf',
          toolId: tempUserData.tool._id,
          startDate: Date.now(),
          endDate: Date.now(),
          transactionDate: Date.now(),
        })
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });
    it('should respod with a 409 status', () => {
      return superagent.post(`${API_URL}/api/transactions`)
        .send(tempUserData.transaction)
        .catch(res => {
          expect(res.status).toEqual(409);
        });
    });
  });
  describe('Testing GET', () => {
    it('should return a transaction and a 200 status', () => {
      return superagent.get(`${API_URL}/api/transactions/${tempUserData.transaction._id}`)
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.body._id).toEqual(tempUserData.transaction._id);
          expect(res.body.borrowerId).toEqual(tempUserData.borrower._id);
          expect(res.body.toolId).toEqual(tempUserData.tool._id);
          expect(res.body.startDate).toExist();
          expect(res.body.endDate).toExist();
          expect(res.body.transactionDate).toExist();
        });
    });
    it('should respond with a 404 not found', () => {
      return superagent.get(`${API_URL}/api/transactions:id=fjsd02r9fjasl392ff39jf`)
        .catch(res => {
          expect(res.status).toEqual(404);
        });
    });
  });
  describe('Testing PUT', () => {
    it('should return a transaction and a 200 status', () => {
      return superagent.put(`${API_URL}/api/transactions/${tempUserData.transaction._id}`)
        .set('Authorization', `Bearer ${tempUserData.token}`)
        .send({
          transactionDate: Date.now(),
        })
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.body.endDate).toExist();
          expect(res.body.startDate).toExist();
          expect(res.body.toolId).toEqual(tempUserData.tool._id);
          expect(res.body._id).toEqual(tempUserData.transaction._id);
          expect(res.body.borrowerId).toEqual(tempUserData.borrower._id);
          expect(res.body.transactionDate !== tempUserData.transaction.transactionDate).toBeTruthy();
        });
    });
    it('should respond with a 401 status because user cannot change another users transaction', () => {
      return mockUser.createOne()
        .then(userData => {
          return userData;
        })
        .then(userData => {
          let putTestUserData = userData;
          return superagent.put(`${API_URL}/api/transactions/${tempUserData.transaction._id}`)
            .set('Authorization', `Bearer ${putTestUserData.token}`)
            .send({
              transactionDate: Date.now(),
            })
            .catch(res => {
              expect(res.status).toEqual(401);
            });
        });
    });
  });
});
