const express = require('express')
const checkEmail = require('../controller/checkEmail')
const registerUser = require('../controller/registerUser')
const checkPassword = require('../controller/checkPassword')
const userDetails = require('../controller/userDetails')
const logout = require('../controller/logout')
const updateUserDetails = require('../controller/updateUserDetails')
const searchUser = require('../controller/searchUser')
const forgetPassword = require('../controller/forgotPassword')
const resetPassword = require('../controller/ResetPassword')
const { markMessagesAsRead } = require('../controller/ReadMessage')


const router = express.Router()

//create user api
router.post("/register",registerUser)
//check user email
router.post('/email',checkEmail)
//check user password
router.post('/password',checkPassword)
//login user details
router.get('/user-details',userDetails)
//logout user
router.get('/logout',logout)
//update user details
router.post('/update-user',updateUserDetails)
//search user
router.post("/search-user",searchUser)


router.post('/forgot-password',forgetPassword)
router.post('/reset-password/:token',resetPassword)
router.post('mark-messages-as-read',markMessagesAsRead)


module.exports = router