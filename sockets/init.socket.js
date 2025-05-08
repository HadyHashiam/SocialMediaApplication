

module.exports = io => {
  io.on("connection", socket => {
    socket.on('joinNotificationsRoom', id => {
      socket.join(id)
      console.log("\n####### the current user logged joined on server ( from sockets)= " + id)
    })

    socket.on("goOnline", id => {
      io.onlineUsers[id] = true;
      socket.on("disconnect", () => {
        io.onlineUsers[id] = false;
        console.log(`Online Users for ${id} `, io.onlineUsers);

      });
    });
  });
};
