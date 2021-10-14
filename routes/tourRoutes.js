const express = require('express');
const {
  createTour,
  getAllTours,
  getOneTour,
  deleteTour,
  updateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
  // checkID,
  // checkBody,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController')
const { getAllReviews, createReview } = require('../controllers/reviewController')
const reviewRouter = require('./../routes/reviewRoutes')

const router = express.Router();

// router.param('id', checkID)

router.use('/:tourId/reviews', reviewRouter)

router
  .route('/top-5-cheap')
  .get(aliasTopTours, getAllTours);

router
  .route('/tour-stats')
  .get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin)
// /tours-distance/233/-40.45/unit/mi

router
  .route('/distances/:latlng/unit/:unit')
  .get(getDistances)
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getOneTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// router.route('/:tourId/reviews').post(protect, restrictTo('user'), createReview)

module.exports = router;
