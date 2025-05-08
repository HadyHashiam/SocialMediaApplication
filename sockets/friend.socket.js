//3 
const { getUserFriendsById } = require('../src/Modules/Friends/controller/friend.Controller');

module.exports = io => {
  io.on('connection', socket => {
    // عند تلقي طلب الصداقة من العميل
    socket.on('sendFriendRequest', data => {

      console.log("data from on sendFriendRequest Event :", data);
      console.log("server received the client request");

      io.to(data.ParamUserId).emit('newFriendRequest', {
        name: data.CurrentUserName, id: data.currentUserId, image: data.CurrentUserImage
      })

    });

    socket.on("getOnlineFriends", async id => {
      try {
        console.log("$$ getOnlineFriends event triggered for user ID:", id);
        const userFriends = await getUserFriendsById(id);
        
        const onlineFriends = userFriends.filter(
          friend => io.onlineUsers[friend.id]
        );
        socket.emit("onlineFriends", onlineFriends);

      } catch (err) {
        console.error("Error fetching online friends:", err.message);
        socket.emit("onlineFriends", []); // fallback empty
      }
    });
        // // 2
    // socket.on("getOnlineFriends", id => {
    //   console.log("$$ $$ $$ getOnlineFriends event triggered for user ID:", id);
    //   // 4
    //   GetFriendsOfUser(id).then(userFriends => {
    //     let onlineFriends = userFriends.filter(
    //       friend => io.onlineUsers[friend.id]
    //     );
    //     console.log("##### Online friends for user ID", id, ":", onlineFriends);
    //     // 5  
    //     socket.emit("onlineFriends", onlineFriends);
    //   });
    // });

  });
}



