const express = require('express');
const router = express.Router();

const pageController = require('./controller/page.controller');
// const authService = require("../Auth/controller/auth.Controller");


router.get('/home', pageController.getHome);
router.get('/signup', pageController.getSignup);
router.get('/login', pageController.getlogin);
router.get('/logout', pageController.getlogout);
router.get('/profile', pageController.getProfile);
router.get("/profile/:id", pageController.getProfile);
router.get("/chatPage/:chatId", pageController.getChatPage);

router.get('/home/search', pageController.getSearch);

module.exports = router;
