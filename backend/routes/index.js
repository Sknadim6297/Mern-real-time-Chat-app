const express = require('express')
const registerUser = require('../controller/registerUser')

const logout = require('../controller/logout')

const searchUser = require('../controller/searchUser')
const checkEmail = require('../controller/CheckEmail')
const checkPassword = require('../controller/CheckPassword')
const userDetails = require('../controller/UserDetails')
const updateUserDetails = require('../controller/UpdateUserDetails')

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


module.exports = router