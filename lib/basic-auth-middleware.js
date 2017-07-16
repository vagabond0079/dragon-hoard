'use strict';

const User = require('../model/user.js');

module.exports = (req, res, next) => {
  const {authorization} = req.headers;

  if(!authorization)
    return next(new Error('Unauthorized, no authorization provided'));

  let encoded = authorization.split('Basic')[1];
  if(!encoded)
    return next(new Error('Unauthorized, no basic authorization provided'));

  let decoded = new Buffer(encoded, 'base64').toString();
  let [username, password] = decoded.split(':');

  if(!username || !password)
    return next(new Error('Unauthorized, username or password is missing, please try again'));

  User.findOne({username})
    .then(user => {
      if(!user)
        return next(new Error('Unauthorized, user does not exist'));
      return user.passwordHashCompare(password);
    })
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error('Unauthorized, find one has failed in basic auth middleware'));
    });
};
