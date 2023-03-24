const jwt = require('jsonwebtoken');

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
}

function errorHandler(err, req, res, next) {

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? 'test' : err.stack,
  });
}

function isAuthenticated(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).json({message:"User not logged in"});
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.payload = payload;
  } catch (err) {
    res.status(401);
    if (err.name === 'TokenExpiredError') {
      throw new Error(err.name);
    }
    throw new Error('Un-Authorized');
  }

  return next();
}

function isAdmin(req, res, next){
  const { userRole } = req.payload
  if(userRole != "ADMIN"){
    return res.status(403).json({message:'Access denied. Must be an admin'})
  }
  return next()
}

function isUser(req, res, next){
  const { userRole } = req.payload
  if(userRole != "ADMIN" & userRole != "USER"){
    return res.status(403).json({'message':'Access denied.Must be a user'})
  }
  return next()
}

module.exports = {
  notFound,
  errorHandler,
  isAuthenticated,
  isAdmin,
  isUser
};
