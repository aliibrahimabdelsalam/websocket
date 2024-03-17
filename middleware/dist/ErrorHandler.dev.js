"use strict";

var AppError = require("../errors/AppError");

var BadRequest = require("../errors/BadRequest");

var NotFound = require("../errors/NotFound");

var UnauthorizedError = require("../errors/unAuthorized");

var ErrorHandler = function ErrorHandler(err, req, res, next) {
  switch (true) {
    case err instanceof UnauthorizedError:
      return res.status(err.statusCode).json({
        status: 'fail',
        message: err.message
      });

    case err instanceof BadRequest:
      return res.status(err.statusCode).json({
        status: 'fail',
        message: err.message
      });

    case err instanceof NotFound:
      return res.status(err.statusCode).json({
        status: 'fail',
        message: err.message
      });

    case err.name === 'ValidationError':
      var errorMessage = Object.values(err.errors).map(function (val) {
        return val.message;
      }).join(', ');
      return res.status(400).json({
        status: 'fail',
        message: errorMessage
      });

    case err.name === 'MongoServerError' && err.code === 11000:
      var duplicateKey = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        status: 'fail',
        message: "The ".concat(duplicateKey, " is already taken.")
      });

    case err.name === "JsonWebTokenError":
      return res.status(401).json({
        status: 'fail',
        message: "Invalid token. Please log in again."
      });

    case err.name === 'TokenExpiredError':
      return res.status(401).json({
        status: 'fail',
        message: "Token is expired. Please log in again."
      });

    case err.status === 404:
      return res.status(404).json({
        status: 'fail',
        message: "Cannot find ".concat(req.originalUrl, " on this server.")
      });

    default:
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error.'
      });
  }
};

module.exports = ErrorHandler;
//# sourceMappingURL=ErrorHandler.dev.js.map
