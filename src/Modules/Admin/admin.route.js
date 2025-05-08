const express = require("express");
const { getUserValidator, createUserValidator, updateUserValidator, deleteUserValidator, changeUserPasswordValidator, updateLoggedUserValidator, } = require('../User/userValidator');
const { getUsers, getUser, updateUser, deleteUser, uploadUserImage, resizeImage, changeUserPassword, getLoggedUserData, updateLoggedUserPassword, updateLoggedUserData, deleteLoggedUserData, } = require('./controller/admin.controller');

const authService = require('../Auth/controller/auth.Controller');

const router = express.Router();

router.route('/users')
  .get(getUsers)

router.route('/user/:id')
  .get(getUserValidator, getUser)
  .put(authService.protect, updateUser)
  .delete(authService.protect, authService.allowedTo('admin'), deleteUserValidator, deleteUser);

// router.put('user/changePassword/:id', authService.protect, authService.allowedTo('admin'), changeUserPassword);


module.exports = router;
