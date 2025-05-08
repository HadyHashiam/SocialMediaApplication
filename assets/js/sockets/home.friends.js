// 1
socket.emit("getOnlineFriends", id);

// 6  in home.js
socket.on("onlineFriends", friends => {
  setTimeout(() => {
    let div = document.getElementById("onlineFriendsList");
    if (friends.length === 0) {
      div.innerHTML = `<p class="alert alert-danger">No online friends</p>`;
    } else {
      let html = ``;
      friends.forEach(friend => {
        html += `
          <div class="online-user">
            <div class="profile-photo">
              <img src="${friend.image}" alt="User Photo">
              <span class="online-dot"></span>
            </div>
            <h5><a href="/chatPage/${friend.chatId}">${friend.name}</a></h5>
          </div>  
        `;
      });

      div.innerHTML = html;
    }
  }, 100);
});
