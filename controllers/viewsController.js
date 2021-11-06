const Tour = require('./../models/tourModel')
const Booking = require('./../models/bookingModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getOverview = catchAsync(async (req, res, next) => {
  //1. get tour dât from collection
  const tours = await Tour.find()
  //2. build template
  //3. render that template using tour from 1.

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  })
})
exports.getTour = catchAsync(async (req, res, next) => {
  //1. get the data, for the requested tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  })

  // if (!tour) {
  //   return next(new AppError('There is no tour with that name.', 404))
  // }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;", "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: tour.name,
      tour
    })

}
)
exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  })
}
exports.getAccount = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  })
}
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  })
}
exports.getMyTours = async (req, res) => {
  //1. find all bookings
  const bookings = await Booking.find({ user: req.user.id })

  //2. find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour)
  const tours = await Tour.find({ _id: { $in: tourIDs } })

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  })
}
exports.updateUserData = (req, res, next) => {
  console.log(req.body)
}