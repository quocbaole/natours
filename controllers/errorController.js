const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}
const handleDublicateFieldDB = err => {

  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)

  const message = `Duplicate field value: ${value}. Please try another one!`
  return new AppError(message, 400)
}
const handleValidationDB = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  console.log(5)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}
const handleJWTExpiredError = err => new AppError('Your token has expired! Please log in again.', 401)

const handleJWTError = err => new AppError('Invalid token. Please log in again', 401)

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorProd = (err, res) => {

  if (err.isOperational) {

    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message
    })
  } else {

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong! '
    })
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)

  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err }
    let error = Object.assign(err)
    error.errmsg = err.errmsg;
    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error)
    if (error._message === 'Validation failed') error = handleValidationDB(error)
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error)
    // if (error.code === 11000) error = handleDublicateFieldDB(error)
    // if (error.code === 11000) error = handleDublicateFieldDB(error)
    sendErrorProd(error, res)
  }

}