const express = require('express');

const { getUsers, getUser, updateUser, deleteUser, changeUserPassword, getLoggedUserData, updateLoggedUserPassword, updateLoggedUserData, deleteLoggedUserData, changeUserPhoto } = require('./controller/user.Controller');
const { uploadSingleImage, resizeImage } = require('../../middlewares/uploadImage');

const postsRoute = require('../Posts/post.Route');

const router = express.Router();

// Nested route
router.use('/:id/posts', postsRoute);

router.get('/getMe', getLoggedUserData, getUser);
router.put('/changeMyPassword', updateLoggedUserPassword);
router.put('/updateMe', updateLoggedUserData);
router.delete('/deleteMe', deleteLoggedUserData);


router.route('/:id')
  .get(getUser)



router.post(
  "/profilePicture",
  uploadSingleImage("image"),
  resizeImage("profile"),
  changeUserPhoto
);

router.post(
  "/coverPicture",
  uploadSingleImage("image"),
  resizeImage("cover"),
  changeUserPhoto
);

module.exports = router;
