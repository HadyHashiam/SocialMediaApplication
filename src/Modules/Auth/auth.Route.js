const express = require('express');
const router = express.Router();
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../../models/user.Model")
const { postSignup, postlogin, forgotPassword, verifyPassResetCode, resetPassword, PostLogout, TestCookie } = require('./controller/auth.Controller');
const authService = require("../Auth/controller/auth.Controller");



// Routes for local authentication
router.post('/signup', postSignup);
router.post('/login', postlogin);
router.post('/logout', authService.protect, PostLogout);
router.get('/test-cookie', authService.protect, TestCookie);

router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPassResetCode);
router.put('/resetPassword', authService.protect, resetPassword);

module.exports = router;





