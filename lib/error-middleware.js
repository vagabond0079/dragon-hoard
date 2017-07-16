'use strict';

module.exports = (err, req, res, next) => {
  err.message = err.message.toLowerCase();
  console.log('err message', err.message);

  // if validation error respond with 400
  if(err.message.includes('validation failed'))
    return(res.sendStatus(400));

  if(err.message.includes('arguments required'))
    return(res.sendStatus(400));

  if(err.message.includes('cast to number failed'))
    return(res.sendStatus(400));

  if(err.message.includes('unexpected field'))
    return(res.sendStatus(400));

  // if password/username validation error respond with 401
  if(err.message.includes('unauthorized'))
    return(res.sendStatus(401));
  //

  // if id not found respond with 404
  if(err.message.includes('objectid failed'))
    return(res.sendStatus(404));

  // if duplicate key respond with 409
  if(err.message.includes('duplicate key'))
    return(res.sendStatus(409));

  return(res.sendStatus(500));
};
