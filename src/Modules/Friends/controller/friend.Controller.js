const ApiError = require('../../../../utils/apiError');
const User = require("../../../../models/user.Model");
const Chat = require("../../../../models/chat.Model");
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const handlerFactory = require('../../handlersFactory');


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







const getUserFriendsById = async (userId) => {
  const currentuser = await User.findById(userId).populate({
    path: 'friends.id',
    select: 'name image'
  });

  if (!currentuser) {
    throw new ApiError('User not found', 404);
  }

  return currentuser.friends.map(friend => ({
    id: friend.id._id,
    name: friend.id.name,
    image: friend.id.image,
    chatId: friend.chatId,
  }));
};


exports.getUserFriendsById = getUserFriendsById;

exports.GetFriendsOfUser = asyncHandler(async (req, res, next) => {
  const userId = getUserIdFromToken(req);

  const userFriends = await getUserFriendsById(userId);

  res.status(200).json({
    status: "success",
    data: userFriends
  });
});


/**
 * * @desc    get FriendRequests of a user
 */
exports.getFriendRequests = asyncHandler(async (req, res, next) => {
  try {
    await handlerFactory.getOne(User)(req, res, next);

  }
  catch (err) {
    console.log(err);
    return next(new ApiError('error in catch User data  ', 401));
  }

  const { documents } = req;
  // console.log("documents:", documents);

  let { friendRequests } = documents;
  // console.log("friends:", friendRequests);

  res.status(200).json({
    status: 'success',
    data: friendRequests,
  });

});

/**
 * * @desc    get SentRequests
 */
exports.getSentRequests = asyncHandler(async (req, res, next) => {
  try {
    await handlerFactory.getOne(User)(req, res, next);

  }
  catch (err) {
    console.log(err);
    return next(new ApiError('error in Creating post ', 401));
  }

  const { documents } = req;
  console.log("documents:", documents);

  let { sentRequests } = documents;
  console.log("friends:", sentRequests);

  res.status(200).json({
    status: 'success',
    data: sentRequests,
  });

});

/**
 * * @desc    Sent FriendRequest
 */
exports.SentFriendRequest = asyncHandler(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  const friendId = req.body.friendId || req.body.ParamUserId;
  const currentuser = await User.findOne({ _id: userId });
  if (!currentuser) {
    return next(new ApiError('currentuser not found', 404));
  }
  // const { friendId } = req.params;
  const friend = await User.findOne({ _id: friendId });
  if (!friend) {
    return next(new ApiError('friend not found', 404));
  }
  // Check if the friend request already exists
  const friendRequestExists = currentuser.sentRequests.some((request) => request.id.toString() === friendId);
  if (friendRequestExists) {
    return next(new ApiError('Friend request already sent', 400));
  }
  // Add the friend to the current user's sentRequests
  currentuser.sentRequests.push({ id: friendId, name: friend.name, image: friend.image });
  await currentuser.save();
  // Add the current user to the friend's friendRequests
  friend.friendRequests.push({ id: userId, name: currentuser.name, image: currentuser.image });
  await friend.save();

  res.status(200).json({
    data: currentuser,
    SentRequests: currentuser.sentRequests,
    status: 'success',
    message: 'Friend request sent successfully',
  });

});



/**
 * * @desc    Accept FriendRequest
 */
exports.AcceptFriendRequest = asyncHandler(async (req, res, next) => {
  const userId = getUserIdFromToken(req);
  const friendId = req.body.ParamUserId || req.body.friendId;

  const currentuser = await User.findOne({ _id: userId });
  if (!currentuser) {
    return next(new ApiError('currentuser not found', 404));
  }

  const friend = await User.findOne({ _id: friendId });
  if (!friend) {
    return next(new ApiError('friend not found', 404));
  }

  let existingChat = await Chat.findOne({
    users: { $all: [userId, friendId], $size: 2 }
  });

  let newChat;
  if (!existingChat) {
    newChat = await Chat.create({
      users: [userId, friendId],
    });
    console.log("New Chat Created:", newChat);
  } else {
    newChat = existingChat;
    console.log("Chat Already Exists:", newChat);
  }

  const friendToAdd = {
    name: friend.name,
    id: friend._id,
    image: friend.image,
    chatId: newChat._id,
  };

  await User.findByIdAndUpdate(userId, {
    $push: { friends: friendToAdd },
  });

  const myDataToAdd = {
    name: currentuser.name,
    id: currentuser._id,
    image: currentuser.image,
    chatId: newChat._id,
  };

  await User.findByIdAndUpdate(friendId, {
    $push: { friends: myDataToAdd },
  });

  await User.findByIdAndUpdate(friendId, {
    $pull: { sentRequests: { id: userId } },
  });

  await User.findByIdAndUpdate(userId, {
    $pull: { friendRequests: { id: friendId } },
  });

  res.status(200).json({
    data: currentuser,
    friends: currentuser.friends,
    FriendRequests: currentuser.friendRequests,
    status: 'success',
    message: 'Friend request accepted successfully',
  });
});



/**
 * * @desc    Reject FriendRequest
 */
exports.RejectFriendRequest = asyncHandler(async (req, res, next) => {
  const friendId = req.body.ParamUserId || req.body.friendId;
  const userId = getUserIdFromToken(req);
  const currentuser = await User.findOne({ _id: userId });
  if (!currentuser) {
    return next(new ApiError('currentuser not found', 404));
  }
  await User.findByIdAndUpdate(userId, {
    $pull: { friendRequests: { id: friendId } },
  });

  await User.findByIdAndUpdate(friendId, {
    $pull: { sentRequests: { id: userId } },
  });
  res.status(200).json({
    message: 'Friend request Rejected successfully',
    status: 'success',
    data: currentuser,
    FriendRequests: currentuser.friendRequests,
  });
});


/**
 * * @desc    Cancel FriendRequest
 */
exports.CancelFriendRequest = asyncHandler(async (req, res, next) => {
  try {
    const friendId = req.body.friendId || req.body.ParamUserId;
    console.log("FriendId from body :", friendId);
    // const friendId =  req.body.requestId;
    // const{ friendId} =  req.body;
    const userId = getUserIdFromToken(req);
    const currentuser = await User.findOne({ _id: userId });
    if (!currentuser) {
      return next(new ApiError('currentuser not found', 404));
    }
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { sentRequests: { id: friendId } },
      });

      await User.findByIdAndUpdate(friendId, {
        $pull: { friendRequests: { id: userId } },
      });
    } catch (err) {
      console.log("Error in pulling friend requests:", err);
    }

    res.status(200).json({
      message: 'Friend request Cancelled successfully',
      status: 'success',
      data: currentuser,
      SentRequests: currentuser.sentRequests,
    });
  } catch (err) {
    console.log("the whole error: " + err);
    next(err);
  }

}
);
/**
 * * @desc    Delete FriendRequest
 */
exports.DeleteFriend = asyncHandler(async (req, res, next) => {

  const friendId = req.body.friendId || req.body.ParamUserId;
  console.log("Body:", req.body);
  // const id = req.params;
  console.log("friendId:", friendId);
  // const friendId =  req.body.requestId;
  // const{ friendId} =  req.body;
  const userId = getUserIdFromToken(req);
  const currentuser = await User.findOne({ _id: userId });
  if (!currentuser) {
    return next(new ApiError('currentuser not found', 404));
  }
  await User.findByIdAndUpdate(userId, {
    $pull: { friends: { id: friendId } },
  });

  await User.findByIdAndUpdate(friendId, {
    $pull: { friends: { id: userId } },
  });

  res.status(200).json({
    message: ' Delete Friend Successfully',
    status: 'success',
    data: currentuser,
    Friends: currentuser.friends,
  });

});

























