const ApiError = require('../../../../utils/apiError');
const User = require("../../../../models/user.Model");
const Comment = require("../../../../models/Comment.Model");
const Post = require("../../../../models/Post.Model");
const asyncHandler = require('express-async-handler');
const handlerFactory = require('../../handlersFactory');
const jwt = require('jsonwebtoken');

const getUserIdFromToken = (req) => {
  try {
    let token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    if (!token) throw new ApiError('No token provided', 401);
    // console.log("Extracted Token:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log("Decoded Token:", decoded);
    return decoded.userId;
  } catch (err) {
    console.error("Token verification error:", err);
    throw new ApiError('Invalid token', 401);
  }
};
// Create a comment
exports.createComment = async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req);
    const { postId, content } = req.body;
    let postData = {
      postId: postId,
      content: content,
      userId: userId
    }

    const comment = await Comment.create(postData);
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: { commentId: comment._id, content: comment.content, userId: comment.userId } }
    });

    res.status(201).json({
      status: 'success',
      data: {
        comment
      }
    });
  } catch (error) {
    next(error);
  }
};
// // Get all comments
// exports.getAllComments = handlerFactory.getAll(Comment);

/**
 * * @desc    Get all posts
 */
exports.getAllComments = asyncHandler(async (req, res, next) => {
  try {
    await handlerFactory.getAll(Comment, "Comments")(req, res, next);
    const { documents, paginationResult } = req;
    const sortedDocuments = documents.sort((a, b) => a.code - b.code);
    res.status(200).json({
      status: 'success',
      results: sortedDocuments.length,
      paginationResult,
      data: sortedDocuments,
    });
  } catch (err) {
    console.log(err);
    next(new ApiError(`Failed to retrieve Messages data , ${err} `, 500));
  }
});


//get all comments for a specific post
exports.getAllCommentsForPost = asyncHandler(async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ postId })
      .populate({
        path: 'userId',
        select: 'name email image',
      })
      .populate({
        path: 'replies.userId',
        select: 'name email image',
      });
    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: {
        comments
      }
    });
  } catch (error) {
    next(error);
  }
});


// post reply on post specific comment
exports.postReply = async (req, res, next) => {
  try {
    const { commentId, content } = req.body;
    const userId = getUserIdFromToken(req);
    // Find the comment to which the reply is being made
    const comment = await Comment.findById(commentId);
    if (!comment) {
      console.warn('Comment not found for ID:', commentId);
      return next(new ApiError('Comment not found', 404));
    }
    // Create the reply object
    const reply = {
      commentId: comment._id,
      content,
      userId,
      createdAt: new Date(),
    };
    comment.replies.push(reply);
    await comment.save();
    // Populate userId in the reply before sending response
    const populatedComment = await Comment.findById(commentId).populate({
      path: 'replies.userId',
      select: 'name email image',
    });

    const newReply = populatedComment.replies[populatedComment.replies.length - 1];

    res.status(201).json({
      status: 'success',
      data: {
        reply: newReply,
      },
    });
  } catch (error) {
    console.error('Error while posting reply:', error);
    next(error);
  }
};








// Get a single comment
exports.getComment = handlerFactory.getOne(Comment);

// Check ownership
const checkCommentOwnership = async (user, commentId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError('Comment not found', 404);
  }
  if (comment.userId.toString() !== user.id.toString()) {
    if (user.role !== 'admin') {
      throw new ApiError('You are not authorized to perform this action because you are neither the owner nor an admin', 403);
    } else {
    }
  }
};


// Update a comment
exports.updateComment = async (req, res, next) => {
  try {
    await checkCommentOwnership(req.user.id, req.params.id);
    const updatedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
      status: 'success',
      data: {
        comment: updatedComment
      }
    });
  } catch (error) {
    next(error);
  }
};


// Delete a comment

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    await checkCommentOwnership(req.user, id);
    const deletedComment = await Comment.findByIdAndDelete(id);

    if (!deletedComment) {
      return next(new ApiError('No comment found with that ID', 404));
    }

    // Remove comment reference from the corresponding post
    await Post.findByIdAndUpdate(deletedComment.postId, {
      $pull: { comments: { commentId: deletedComment._id } }
    });

    res.status(200).json({
      status: 'success',
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};



