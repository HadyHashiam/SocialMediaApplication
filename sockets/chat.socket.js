

module.exports = io => {
  io.on("connection", socket => {
    socket.on("joinChat", chatId => {
      socket.join(chatId);
    });

    socket.on("sendMessage", (msg) => {
      console.log("server received the Msg ChatData ");
      console.log("data from on sendMessage  :", msg);
      io.to(msg.chatId).emit("receiveMessage", msg);

    });

  });
};
