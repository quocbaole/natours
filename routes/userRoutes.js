const express = require('express')
const { getOneUser, getAllUsers, createUser, updateUser, deleteUser, updateMe, deleteMe, getMe, uploadUserPhoto, resizeUserPhoto } = require('../controllers/userController')
const { signup, login, forgotPassword, resetPassword, updatePassword, protect, restrictTo, logout } = require('../controllers/authController')


const router = express.Router()


router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

router.use(protect)

router.patch('/updateMyPassword', updatePassword)
router.get('/me', getMe, getOneUser)
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe)
router.delete('/deleteMe', deleteMe)

router.use(restrictTo('admin'))

router
    .route('/')
    .get(getAllUsers)
    .post(createUser)
router
    .route('/:id')
    .get(getOneUser)
    .patch(updateUser)
    .delete(deleteUser)


module.exports = router