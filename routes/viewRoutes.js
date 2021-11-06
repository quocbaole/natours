const express = require('express')
const { getOverview, getTour, getLoginForm, getAccount, updateUserData, getMyTours } = require('../controllers/viewsController')
const { isLoggedin, protect } = require('../controllers/authController')
const { getCheckoutSession, createBookingCheckout } = require('../controllers/bookingController')

const router = express.Router()


router.get('/', createBookingCheckout, isLoggedin, getOverview)


router.get('/tour/:slug', isLoggedin, getTour)
router.get('/login', isLoggedin, getLoginForm)
router.get('/me', protect, getAccount)
router.get('/my-tours', protect, getMyTours)

router.post('/submit-user-data', updateUserData)

module.exports = router