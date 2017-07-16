'use strict';

// npm modules
const {Router} = require('express');
const jsonParser = require('body-parser').json();

// app modules
const Profile = require('../model/profile.js');
const s3Upload = require('../lib/s3-upload-middleware.js');
const basicAuth = require('../lib/basic-auth-middleware.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

// module logic
const profileRouter = module.exports = new Router();

// /api/signup
profileRouter.post('/api/profile', bearerAuth, s3Upload('image'), (req, res, next) => {
  console.log('Hit POST /api/profile');
  new Profile({
    address: req.body.address,
    phone: req.body.phone,
    realName: req.body.realName,
    picURI: req.s3Data.Location,
    userId: req.user._id.toString(),
  })
    .save()
    .then(profile => {
      res.send(profile);})
    .catch(next);
});

profileRouter.get('/api/profile/:id', jsonParser, (req, res, next) => {
  console.log('Hit GET /api/profile');
  return Profile.findById(req.params.id)
    .then(profile => res.json(profile))
    .catch(next);
});

profileRouter.delete('/api/profile/:id', bearerAuth, (req, res, next) => {
  console.log('Hit DELETE /api/profile');
  Profile.findById(req.params.id)
    .then(profile => {
      if(req.user._id.toString() !== profile.userId.toString()){
        throw Error('Unauthorized cannot change another users profile');
      }
      return profile;
    })
    .then(profile => {
      Profile.findByIdAndRemove(req.params.id)
        .then(() => res.sendStatus(204))
        .catch(next);
    })
    .catch(next);
});

profileRouter.put('/api/profile/:id',bearerAuth, jsonParser, (req, res, next) => {
  console.log('Hit PUT /api/profile');
  let options ={
    new: true,
  };
  Profile.findById(req.params.id)
    .then(profile => {
      if(req.user._id.toString() !== profile.userId.toString()){
        throw Error('Unauthorized cannot change another users profile');
      }
      return profile;
    })
    .then(profile => {
      Profile.findOneAndUpdate(req.params.id, req.body, options)
        .then(profile => res.json(profile))
        .catch(next);
    })
    .catch(next);
});
