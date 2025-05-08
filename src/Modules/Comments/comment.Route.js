const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  createComment, getAllComments, getComment, updateComment, deleteComment, getAllCommentsForPost, postReply

} = require('./controller/comment.controller');

// CRUD operations for comments
router
  .route('/')
  .post(createComment)
  .get(getAllComments);
router
  .route('/post/reply')
  .post(postReply)

router
  .route('/:id')
  .get(getComment)
  .put(updateComment)
  .delete(deleteComment);


router.get('/post/:postId', getAllCommentsForPost)

module.exports = router;