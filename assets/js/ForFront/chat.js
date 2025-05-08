// DOM Elements
const chatInput = document.querySelector('.chat-input input');
const sendButton = document.querySelector('.chat-input button');
const messagesContainer = document.querySelector('.chat-messages');
const chatHeader = document.querySelector('.chat-header');
const chatList = document.querySelector('.chat-list');

// Hidden inputs
const currentUserId = document.querySelector('#currentUserId').value;
const chatIdInput = document.querySelector('#chatId').value;
const friendUserId = document.querySelector('#FriendUserId').value;
const friendUserName = document.querySelector('#FriendUserName').value;
const friendUserImage = document.querySelector('#FriendUserImage').value;

// Current chat state
let currentChatId = chatIdInput;
let currentChatUser = {
  id: friendUserId,
  name: friendUserName,
  image: Helpers.processImage(friendUserImage),
  chatId: chatIdInput,
};



// API: Fetch all chats for the current user
async function fetchChatList() {
  try {
    const response = await fetch(`http://localhost:3000/chat/${currentUserId}`);
    const result = await response.json();
    return result.status === 'success' ? result.data : [];
  } catch (error) {
    console.error('Error fetching chat list:', error);
    return [];
  }
}

// API: Fetch all messages of a chat
async function fetchMessages(chatId) {
  if (!chatId || chatId === 'undefined') {
    console.warn('Invalid chatId:', chatId);
    return [];
  }

  try {
    const response = await fetch(`http://localhost:3000/Message/${chatId}`);
    const result = await response.json();
    return result.status === 'success' ? result.data : [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// UI: Create a single message element and add it
function addMessage(text, type = 'sent') {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', type);
  messageDiv.innerText = text;
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// UI: Scroll chat to the bottom
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// API: Send message to backend
async function sendMessageToServer(chatId, text) {
  try {
    const response = await fetch(`http://localhost:3000/message/${chatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const result = await response.json();
    return result.status === 'success' ? result.data : null;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

// UI: Load all chats in sidebar
async function populateChatList(chats) {
  chatList.innerHTML = '';

  for (const chat of chats) {
    const friend = chat.users.find((user) => user._id !== currentUserId);
    if (!friend || !chat._id) continue;

    const messages = await fetchMessages(chat._id);
    const lastMessage = messages.length ? messages[messages.length - 1].text : 'No messages yet';

    const chatItem = document.createElement('li');
    chatItem.classList.add('chat-item');
    if (chat._id === currentChatId) chatItem.classList.add('active');

    chatItem.innerHTML = `
      <img src="${Helpers.processImage(friend.image)}" alt="profile">
      <div class="chat-info">
        <h4>${friend.name}</h4>
        <p>${lastMessage}</p>
      </div>
    `;

    chatItem.dataset.chatId = chat._id;
    chatItem.dataset.friendId = friend._id;
    chatItem.dataset.friendName = friend.name;
    chatItem.dataset.friendImage = Helpers.processImage(friend.image);

    chatItem.addEventListener('click', () => {
      document.querySelectorAll('.chat-item').forEach((el) => el.classList.remove('active'));
      chatItem.classList.add('active');
      window.history.pushState({}, '', `http://localhost:3000/chatPage/${chat._id}`);
      loadChat({
        id: friend._id,
        name: friend.name,
        image: Helpers.processImage(friend.image),
        chatId: chat._id,
      });
    });

    chatList.appendChild(chatItem);
  }
}

// دالة بسيطة في الـ Frontend تشبه processImage بتاعت الـ Backend
function processImage(image, defaultImage = '/images/default.png') {
  if (!image) return defaultImage;
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/images')) {
    return image;
  }
  return `/images/${image}`;
}

// UI: Load chat conversation
async function loadChat(friend) {
  if (!friend.chatId) return;

  currentChatUser = friend;
  currentChatId = friend.chatId;

  chatHeader.querySelector('h4').innerText = friend.name;
  chatHeader.querySelector('img').src = processImage(friend.image, '/images/default.png'); // ✅ استخدم المعالجة هنا

  messagesContainer.innerHTML = '';
  const messages = await fetchMessages(friend.chatId);

  messages.forEach((msg) => {
    const type = msg.sender === currentUserId ? 'sent' : 'received';
    addMessage(msg.text, type);
  });
}


// Init page (first load)
async function init() {
  const chats = await fetchChatList();
  await populateChatList(chats);

  if (!currentChatId || currentChatId === 'undefined') {
    console.warn('No initial chatId. Loading the first chat...');
    if (chats.length > 0) {
      const firstChat = chats[0];
      const friend = firstChat.users.find((u) => u._id !== currentUserId);
      if (friend) {
        currentChatId = firstChat._id;
        currentChatUser = {
          id: friend._id,
          name: friend.name,
          image: Helpers.processImage(friend.image),
          chatId: firstChat._id,
        };
        window.history.pushState({}, '', `http://localhost:3000/chatPage/${currentChatId}`);
      }
    }
  }

  loadChat(currentChatUser);
}

// UI Event: Send button click
sendButton.addEventListener('click', async () => {
  const messageText = chatInput.value.trim();
  if (!messageText) return;

  addMessage(messageText, 'sent');
  const result = await sendMessageToServer(currentChatId, messageText);
  if (result) {
    // إرسال الرسالة عبر Socket.IO لو الإرسال ناجح
    socket.emit('sendMessage', {
      chatId: currentChatId,
      senderId: currentUserId,
      text: messageText,
    });
  } else {
    console.warn('Message send failed. Showing temporarily.');
  }

  chatInput.value = '';
  chatInput.focus();
});

// UI Event: Press Enter key
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendButton.click();
});

// Socket.IO: Receive message
socket.on('receiveMessage', (message) => {
  console.log('Received message:', message);
  if (message.chatId === currentChatId && message.senderId !== currentUserId) {
    addMessage(message.text, 'received');

    const activeChatItem = document.querySelector(`.chat-item[data-chat-id="${currentChatId}"]`);
    if (activeChatItem) {
      activeChatItem.querySelector('.chat-info p').innerText = message.text;
    }
  }
});

// Navbar Image
const navbarUserImage = document.getElementById('navbarUserImage');
if (navbarUserImage && friendUserImage) {
  const processedImage = processImage(friendUserImage, '/images/default.png');
  navbarUserImage.src = processedImage;
}


// Start
init();
