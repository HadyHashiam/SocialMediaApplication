const express = require('express');
const router = express.Router({ mergeParams: true });
const { uploadSingleImage, resizeImage } = require('../../middlewares/uploadImage');

const {
  GetAllPost,
  GetSinglePost,
  CreatePost,
  LikePost,
  UpdatePost,
  DeletePost,
  GetUserTimelinePosts,
  DeletePostByUser,
  createFilterObj
} = require('./controller/post.controller');

const authService = require('../Auth/controller/auth.Controller');


// for admin
router.get('/', createFilterObj, GetAllPost)


// for user posts
router.get('/timeline', GetUserTimelinePosts)


router.get("/:id", GetSinglePost)

router.post("/",
  uploadSingleImage("image"),
  resizeImage("post"),
  CreatePost
)
router.post("/like", LikePost)

router.patch("/:id", UpdatePost)
router.delete("/delete", DeletePostByUser)
// router.delete("/:id", DeletePost)




module.exports = router;
