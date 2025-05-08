const ApiError = require('../../../../utils/apiError');
const User = require("../../../../models/user.Model");
const Message = require("../../../../models/message.Model");
const Chat = require("../../../../models/chat.Model");
const asyncHandler = require('express-async-handler');
const handlerFactory = require('../../handlersFactory');
const jwt = require('jsonwebtoken');


// Function to get userId from token
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

/**
 * @desc Check if the current_user is ( the Owner ) of the Post
 */
const checkPostOwnership = async (userId, postId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError('Post not found', 404);
  }
  const currentuser = await User.findOne({ _id: userId });
  if (!currentuser) {
    return next(new ApiError('currentuser not found', 404));
  }
  console.log("currentuser id toString() ", currentuser._id.toString())
  console.log("currentuser id ", currentuser._id)
  console.log("the post owner id toString()", post.user.toString())
  console.log("the post owner id ", post.user)

  if (post.user.toString() !== currentuser._id.toString()) {

    if (currentuser.role !== 'admin') {
      throw new ApiError('You are not authorized to perform this action because you are neither the owner nor an admin', 403);
    } else {
      console.log("You are an admin, you can delete this post.");
    }
  } else {
    console.log("You are the owner of this post, you can delete it.");
  }

};
// Nested route
// GET /users/:userId/posts
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.id) filterObject = { user: req.params.id };
  req.filterObj = filterObject;
  next();
};

/**
 * * @desc    Get all posts
 */
exports.GetAllMessages = asyncHandler(async (req, res, next) => {
  try {
    await handlerFactory.getAll(Message, "Messages")(req, res, next);
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


/**
 * * @desc    Get all chat messages for chatId
 */
exports.GetAllMessagesOfChat = asyncHandler(async (req, res, next) => {
  try {
    let chatId = req.params.chatId;
    if (!chatId) {
      return next(new ApiError('Chat ID is required', 400));
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 });

    console.log("messages:", messages);

    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: messages,
    });
  } catch (err) {
    console.log(err);
    next(new ApiError(`Failed to retrieve Messages data , ${err} `, 500));
  }
});



/**
 * * * @desc    Create a new Message
 */
exports.CreateMessage = asyncHandler(async (req, res, next) => {
  try {

    const chatId = req.params.chatId;
    const userId = getUserIdFromToken(req);

    const currentuser = await User.findOne({ _id: userId });
    if (!currentuser) {
      return next(new ApiError('currentuser not found', 404));
    }

    const bodyData = req.body;
    MessageData = {
      ...bodyData,
      sender: userId,
      chat: chatId,
    };

    await handlerFactory.createOne(Message, MessageData)(req, res, next);
    const { document } = req;


    res.status(201).json({ data: document, message: 'Post created successfully', status: 'success' });
  } catch (err) {
    console.log(err);
    next(new ApiError(`Failed to create Message , ${err} `, 500));
  }
});




/**
 * * @desc    Delete a post Any way by factory
 */
exports.DeleteMessage = handlerFactory.deleteOne(Message);

// Get a single Message
exports.GetSingleMessage = handlerFactory.getOne(Message);
exports.UpdateMessage = handlerFactory.updateOne(Message);



