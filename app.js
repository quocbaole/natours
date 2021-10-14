const { response } = require('express');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();
const morgan = require('morgan');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const Tour = require('./models/tourModel');

console.log(process.env.NODE_ENV);

//1. GLOBAL MIDDLEWARES
//security http headers
app.use(helmet())

//development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter)

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//data sanitizarion against noSQL query injection
app.use(mongoSanitize())

//data sanitization against XSS
app.use(xss())

//prevent param pollution
app.use(hpp({
    whitelist: [
        'duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price'
    ]
}))

//serving static files
app.use(express.static(`${__dirname}/public`));

//test middlewares
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {

    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statusCode = 404


    next(new AppError(`Can't find ${req.originalUrl} on this server`), 404)
})

app.use(globalErrorHandler)

module.exports = app;
