const router = require("express").Router();
const friendController = require("./controller/friend.Controller");




// get all friends of user
router.get("/user/:id", friendController.GetFriendsOfUser);

// get all friend Requests of user
router.get("/friendRequests/:id", friendController.getFriendRequests);

// get all sent Requests of user
router.get("/sentRequests/:id", friendController.getSentRequests);

// send friend request 
router.post("/sentrequest", friendController.SentFriendRequest);

// Accept friend request
router.post("/accept", friendController.AcceptFriendRequest);

router.post("/cancel", friendController.CancelFriendRequest);

// Reject friend request
router.post("/reject", friendController.RejectFriendRequest);

// Cancel friend from friends
router.post("/delete", friendController.DeleteFriend);




module.exports = router;
