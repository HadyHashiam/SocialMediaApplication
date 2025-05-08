const ApiError = require('../../../../utils/apiError');
const User = require("../../../../models/user.Model");
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const handlerFactory = require('../../handlersFactory');
const Post = require('../../../../models/Post.Model');


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
 * @desc Get user's timeline posts
 */
exports.GetUserTimelinePosts = asyncHandler(async (req, res, next) => {
  const userId = getUserIdFromToken(req);

  let currentuser = await User.findOne({ _id: userId });
  if (!currentuser) {
    return next(new ApiError("User not found", 404));
  }

  let posts = [];
  for (let i = 0; i < currentuser.timeline.length; i++) {
    let post = await Post.findById(currentuser.timeline[i])
      .populate([
        { path: "likes.users", select: "name image" },
        { path: "user", select: "name image" }
      ]);
    if (post) {
      posts.push(post);
    } else {
      console.warn(`Post with ID ${currentuser.timeline[i]} not found.`);
    }
  }

  // Sort posts by createdAt in descending order (newest first)

  res.status(200).json({
    status: "success",
    results: posts.length,
    data: posts,
  });
});



exports.CreatePost = asyncHandler(async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req);
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return next(new ApiError(`No user found for id ${userId}`, 404));
    }

    console.log('Received file:', req.file);
    console.log('Received body:', req.body);

    const { content, imageType } = req.body;
    if (!content && !req.file) {
      return next(new ApiError('Content or image is required', 400));
    }
    if (req.file && imageType !== 'post') {
      return next(new ApiError('Invalid imageType for post', 400));
    }

    const postData = {
      user: userId,
      content: content || '',
      image: req.file ? req.file.url : null,
      authorname: currentUser.name || 'User',
    };

    const post = await Post.create(postData);
    console.log('Post created:', post);

    const postId = post._id;
    currentUser.timeline.push(postId);
    await currentUser.save({ validateBeforeSave: false });

    const friends = currentUser.friends;

    friends.forEach(async (friend) => {
      const friendId = friend.id;
      const friendDoc = await User.findById(friendId);
      if (friendDoc) {
        friendDoc.timeline.push(postId);
        await friendDoc.save();
      }
    });


    const postResponse = post.toObject();
    postResponse.user = {
      _id: userId,
      image: currentUser.image ? currentUser.image : '/images/default.png',
    };
    postResponse.authorname = currentUser.name || 'User';
    postResponse.image = post.image || null;

    res.status(201).json({ status: 'success', data: postResponse });
  } catch (error) {
    console.error('Error in CreatePost:', error);
    return next(new ApiError(`Failed to create post: ${error.message}`, 500));
  }
});


// /**
//  * * * @desc    Create a new post
//  */
// exports.CreatePost = asyncHandler(async (req, res, next) => {

//   const userId = getUserIdFromToken(req);
//   console.log("Received file:", req.file);
//   console.log("Received body:", req.body);
//   const currentuser = await User.findOne({ _id: userId });
//   if (!currentuser) {
//     return next(new ApiError('currentuser not found', 404));
//   }

//   console.log("Cloudinary public_id:", req.file.filename);
//   console.log("Cloudinary URL:", req.file.url);


//   const bodyData = req.body;
//   // console.log("bodyData:", bodyData);
//   PostData = {
//     ...bodyData,
//     user: userId,
//     authorname: currentuser.name,
//   };

//   await handlerFactory.createOne(Post, PostData)(req, res, next);  // Call handler 
//   const { document } = req;
//   let post = document._id;
//   // push the post id in currentuser timeline
//   currentuser.timeline.push(post);
//   await currentuser.save({ validateBeforeSave: false });

//   const friends = currentuser.friends;

//   friends.forEach(async (friend) => {
//     const friendId = friend.id; // access the id property of each friend object
//     const friendDoc = await User.findById(friendId);
//     if (friendDoc) {
//       friendDoc.timeline.push(post);
//       await friendDoc.save();
//     }
//   });

//   res.status(201).json({ data: document, message: 'Post created successfully' });
// });


/**
 * * @desc    Delete a post
 */
exports.DeletePostByUser = asyncHandler(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  const { postId } = req.body;
  await checkPostOwnership(userId, postId);

  // Find and delete the post
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ApiError('No post found with that ID', 404));
  }

  // // Remove all comments associated with the post
  // await Comment.deleteMany({ _id: { $in: post.comments.map(comment => comment.commentId) } });

  // Delete the post
  await Post.findByIdAndDelete(postId);

  res.status(200).json({
    data: post,
    status: 'success',
    message: 'Post and its associated comments deleted successfully',
  });
});









/**
 * @desc Get all posts
 */
exports.GetAllPost = asyncHandler(async (req, res, next) => {
  try {
    const query = req.params.userId ? { user: req.params.userId } : {};

    const posts = await Post.find(query)
      .populate([{
        path: "likes.users",
        select: "name image",
      }, {
        path: "user",
        select: "name image"
      }
      ])
      .sort({ createdAt: 1 });

    console.log("Posts fetched:", JSON.stringify(posts.map(post => ({
      _id: post._id,
      likes: {
        likesCount: post.likes.likesCount,
        users: post.likes.users.map(user => ({
          _id: user._id,
          name: user.name,
          image: user.image
        }))
      }
    })), null, 2));

    res.status(200).json({
      status: "success",
      results: posts.length,
      data: posts,
    });
  } catch (err) {
    console.log(err);
    next(new ApiError(`Failed to retrieve posts data, ${err}`, 500));
  }
});


// post like and unlike
exports.LikePost = asyncHandler(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  const { postId } = req.body;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ApiError("No post found with that ID", 404));
  }

  // Check if the user has already liked the post
  const alreadyLiked = post.likes.users.includes(userId);

  if (alreadyLiked) {
    // Unlike the post
    post.likes.users.pull(userId);
    post.likes.likesCount -= 1;
  } else {
    // Like the post
    post.likes.users.push(userId);
    post.likes.likesCount += 1;
  }

  await post.save({ validateBeforeSave: false });

  // Populate likes.users before returning
  const populatedPost = await Post.findById(postId).populate({
    path: "likes.users",
    select: "name image",
  });

  res.status(200).json({
    status: "success",
    data: populatedPost,
    message: alreadyLiked ? "Post unliked successfully" : "Post liked successfully",
  });
});






/**
 * * @desc    Delete a post Any way by factory
 */
exports.DeletePost = handlerFactory.deleteOne(Post);

// Get a single Product
exports.GetSinglePost = handlerFactory.getOne(Post);
exports.UpdatePost = handlerFactory.updateOne(Post);



