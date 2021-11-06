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
  // console.log(5)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}
const handleJWTExpiredError = err => new AppError('Your token has expired! Please log in again.', 401)

const handleJWTError = err => new AppError('Invalid token. Please log in again', 401)

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  }
  // console.log(err)
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  })


}

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {

      return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message
      })
    }
    console.log(err)
    return res.status(500).json({
      status: 'error',
      // message: 'Something went wrong! ',
      message: err,
    })

  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    })
  }

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later'
  })
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res)

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
    sendErrorProd(error, req, res)
  }

}