
const chatId = document.getElementById("chatId").value;
// const messagesContainer = document.getElementById("messagesContainer");
// const messageInput = document.getElementById("messageInput");
// const sendButton = document.getElementById("sendButton");
// const chatHeader = document.getElementById("chatHeader");
// const chatList = document.getElementById("chatList");
// const currentUserId = document.getElementById("currentUserId").value;
// const friendUserId = document.getElementById("FriendUserId").value;


socket.emit("joinChat", chatId);


