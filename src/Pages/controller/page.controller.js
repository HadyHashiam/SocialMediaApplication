
const asyncHandler = require('express-async-handler');
const ApiError = require('../../../utils/apiError');
const jwt = require('jsonwebtoken');
const User = require('../../../models/user.Model');
const Post = require('../../../models/Post.Model');
const Chat = require('../../../models/chat.Model');







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




exports.getSignup = asyncHandler(async (req, res, next) => {
  console.log("signup page ")
  res.render("signup.ejs", {
    pageTitle: "signup"

  })
})

exports.getlogin = asyncHandler(async (req, res, next) => {
  res.render("login.ejs", {

    pageTitle: "Login"

  })
})

exports.getlogout = (req, res, next) => {
  res.render("logout.ejs", {
    pageTitle: "logout"
  })
};

// فانكشن للتحقق من إذا كان اللينك URL كامل
const isValidUrl = (string) => string && (string.startsWith('http://') || string.startsWith('https://'));

// فانكشن لمعالجة الصور
const processImage = (image, defaultImage) => {
  if (!image) return defaultImage;
  return isValidUrl(image) ? image : `/images/${image}`;
};

exports.getProfile = asyncHandler(async (req, res, next) => {
  let userId = getUserIdFromToken(req);
  let param_id = req.params.id || req.body.friendId;

  if (!param_id) {
    console.log(`No param_id provided, redirecting to /profile/${userId}`);
    return res.redirect('/profile/' + userId);
  }

  let currentUser = await User.findOne({ _id: userId });
  if (!currentUser) {
    console.log(`Current user not found for ID: ${userId}`);
    return next(new ApiError('Current user not found', 404));
  }

  let ParamUser = await User.findOne({ _id: param_id }).populate({
    path: 'friends.id',
    select: 'name image'
  });

  if (!ParamUser) {
    console.log(`Param user not found for ID: ${param_id}`);
    return next(new ApiError('User from param not found', 404));
  }

  let ParamUserPosts = await Post.find({ user: param_id });
  let chat = await Chat.findOne({ users: { $all: [userId, param_id] } });
  if (!chat) {
    console.log(`Chat not found between users ${userId} and ${param_id}`);
  }

  try {
    // لوجيك الصور
    const CurrentUserImage = processImage(currentUser.image, '/images/default.png');
    const ParamUserImage = processImage(ParamUser.image, '/images/default.png');
    const ParamUserCoverImage = processImage(ParamUser.coverImage, '/images/default_cover.png');

    // لوغات للتحقق
    console.log('Processed images:', {
      CurrentUserImage,
      ParamUserImage,
      ParamUserCoverImage,
    });

    // لوجيك العلاقات
    let isOwner = userId.toString() === param_id;
    let isFriends = currentUser.friends.some(friend => friend.id.toString() === param_id);
    let isRequestSent = currentUser.sentRequests.some(request => request.id.toString() === param_id);
    let isRequestReceived = currentUser.friendRequests.some(request => request.id.toString() === param_id);

    console.log('Profile data:', {
      isOwner,
      isFriends,
      isRequestSent,
      isRequestReceived,
      chatId: chat ? chat._id : null,
    });

    res.render("profile.ejs", {
      currentUserId: currentUser._id,
      CurrentUserImage,
      CurrentUserName: currentUser.name,

      ParamUserId: ParamUser._id,
      ParamUserImage,
      ParamUserCoverImage,
      ParamUserName: ParamUser.name,
      ParamUserBio: ParamUser.bio || 'No bio available',
      ParamUserPosts: JSON.stringify(ParamUserPosts),
      ParamUserFriends: ParamUser.friends,

      isOwner,
      isFriends,
      isRequestSent,
      isRequestReceived,

      chatId: chat ? chat._id : null,

      pageTitle: "Profile"
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.redirect("/error");
  }
});

exports.getHome = asyncHandler(async (req, res, next) => {
  let userId = getUserIdFromToken(req);

  let currentUser = await User.findOne({ _id: userId });
  if (!currentUser) {
    return next(new ApiError('currentuser not found', 404));
  }


  res.render("home.ejs", {
    currentUserId: currentUser._id,
    pageTitle: "Home"

  })
})



exports.getSearch = (req, res, next) => {
  res.render("search.ejs", {
    pageTitle: "Search"
  })
};



exports.getChatPage = asyncHandler(async (req, res, next) => {
  let userId = getUserIdFromToken(req);
  let chatId = req.params.chatId;

  console.log("chatId : ", chatId)
  let chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new ApiError('Chat not found', 404));
  }
  console.log("chat : ", chat)

  // let chat = await Chat.find({ users: { $in: [userId] } })

  let currentUser = await User.findOne({ _id: userId });
  if (!currentUser) {
    return next(new ApiError('currentuser not found', 404));
  }
  // define the secondUserId User in the chat
  let secondUserId = chat.users.find(user => user.toString() !== userId.toString());
  console.log("secondUserId : ", secondUserId)

  let friendUser = await User.findOne({ _id: secondUserId });
  if (!friendUser) {
    return next(new ApiError('friendUser not found', 404));
  }


  res.render("Chat.ejs", {
    CurrentUserName: currentUser.name,
    CurrentUserImage: currentUser.image,
    currentUserId: currentUser._id,
    FriendUserName: friendUser.name,
    FriendUserImage: friendUser.image,
    FriendUserId: friendUser._id,
    chatId: chatId,
    pageTitle: "Chat"
  })

})

