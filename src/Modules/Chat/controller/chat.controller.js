const ApiError = require('../../../../utils/apiError');
const User = require("../../../../models/user.Model");
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
exports.GetAllChats = asyncHandler(async (req, res, next) => {
  try {
    await handlerFactory.getAll(Chat, "Chats")(req, res, next);
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
    next(new ApiError(`Failed to retrieve Chats data , ${err} `, 500));
  }
});


/**
 * * @desc    Get all Chats of a specific user
 */
exports.GetAllChatsOfUser = asyncHandler(async (req, res, next) => {
  try {

    // const userId = getUserIdFromToken(req);
    const userId = req.params.id || req.user._id;
    const Currentuser = await User.findOne({ _id: userId });
    if (!Currentuser) {
      return next(new ApiError('currentuser not found', 404));
    }
    console.log("currentuser id toString() ", Currentuser._id.toString())
    console.log("currentuser id ", Currentuser._id)

    const userChats = await Chat.find({ users: { $in: [userId] } })
      .populate('users', 'name image')  // Populate the users field with name and image
      .sort({ updatedAt: -1 });  // Sort by updatedAt in descending order

    // console.log("userChats:", userChats);

    res.status(200).json({
      status: 'success',
      results: userChats.length,
      data: userChats,
    });
  } catch (err) {
    console.log(err);
    next(new ApiError(`Failed to retrieve Chats data , ${err} `, 500));
  }
});



/**
 * * * @desc    Create a new post
 */
exports.CreateChat = asyncHandler(async (req, res, next) => {

  // const userId = getUserIdFromToken(req);
  // const currentuser = await User.findOne({ _id: userId });
  // if (!currentuser) {
  //   return next(new ApiError('currentuser not found', 404));
  // }

  const bodyData = req.body;
  // console.log("bodyData:", bodyData);
  // PostData = {
  //   ...bodyData,
  //   user: userId,
  //   authorname: currentuser.name,
  // };

  await handlerFactory.createOne(Chat, PostData)(req, res, next);  // Call handler 
  const { document } = req;


  res.status(201).json({ data: document, message: 'Post created successfully' });
});




/**
 * * @desc    Delete a post Any way by factory
 */
exports.DeletePost = handlerFactory.deleteOne(Chat);

// Get a single Product
exports.GetSinglePost = handlerFactory.getOne(Chat);
exports.UpdatePost = handlerFactory.updateOne(Chat);



