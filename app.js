const path = require('path')
const { response } = require('express');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const app = express();
const morgan = require('morgan');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const Tour = require('./models/tourModel');

console.log(process.env.NODE_ENV);

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

//serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//1. GLOBAL MIDDLEWARES
//security http headers
app.use(helmet())

//dunno why but this helps to debug the axios problem
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'https:', 'data:', 'ws:'],
            baseUri: ["'self'"],
            fontSrc: ["'self'", 'https:', 'data:'],
            scriptSrc: [
                "'self'",
                'https:',
                'blob:'
            ],
            styleSrc: ["'self'", 'https:', 'unsafe-inline']
        }
    })
);
// .////////////////////////////////////////////////

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
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

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



//test middlewares
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

//ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {

    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statusCode = 404


    next(new AppError(`Can't find ${req.originalUrl} on this server`), 404)
})

app.use(globalErrorHandler)

module.exports = app;
