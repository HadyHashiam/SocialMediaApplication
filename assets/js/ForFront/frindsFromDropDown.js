

document.addEventListener("DOMContentLoaded", function () {
  const currentUserId = document.getElementById("currentUserId")?.value;

  if (!currentUserId) {
    console.error("User ID is missing");
    return;
  }

  fetch(`/friend/friendRequests/${currentUserId}`)
    .then(response => response.json())
    .then(data => {
      const listContainer = document.getElementById("friendRequestsList");

      // تأكد إنه في داتا
      if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
        // 🟢 للـ Navbar Dropdown
        listContainer.innerHTML = `<input id="currentUserId" type="hidden" name="currentUserId" value="${currentUserId}">`;

        data.data.forEach(friend => {
          const friendElement = document.createElement("div");
          friendElement.classList.add("friend-request");

          friendElement.innerHTML = `
            <div class="friend-request-item" style="display: flex; align-items: center; gap: 10px; padding: 5px 0;">
                    <input id="friendId" type="hidden" name="friendId" value="${friend.id}">

                <a href="/profile/${friend.id}">
                     <img src="${Helpers.processImage(friend.image)}" alt="${friend.name}" style="width: 40px; height: 40px; border-radius: 50%;">
                      </a>
              <a href="/profile/${friend.id}" style="flex-grow: 1; text-decoration: none; color: inherit;">
              <span>${friend.name}</span>
                </a>
              <button class="btn btn-sm btn-success" onclick="acceptFriendRequest('${friend.id}')">Accept</button>
              <button class="btn btn-sm btn-danger" onclick="rejectFriendRequest('${friend.id}')">Reject</button>
            </div>
          `;

          listContainer.appendChild(friendElement);
        });
      } else {
        listContainer.innerHTML += '<div id="no-friend-request" class="text-muted p-2">No friend requests</div>';
      }
      renderFriendRequestsSection(data.data);

    })
    .catch(error => {
      console.error("Error fetching friend requests:", error);
    });
});


function renderFriendRequestsSection(friendRequests) {
  const sectionContainer = document.getElementById("friendRequestsSection");

  if (!sectionContainer) return;

  // مسح الموجود قبل ما نضيف جديد
  sectionContainer.innerHTML = `<h4>Requests</h4>`;

  if (friendRequests.length === 0) {
    sectionContainer.innerHTML += `<p class="text-muted">No friend requests</p>`;
    return;
  }

  friendRequests.forEach(friend => {
    const requestDiv = document.createElement("div");
    requestDiv.classList.add("request");

    requestDiv.innerHTML = `
      <div class="info">
        <div class="profile-photo">
            <a href="/profile/${friend.id}">
            <img src="${Helpers.processImage(friend.image)}" alt="${friend.name}">
            </a>
        </div>
        <div>
          <a href="/profile/${friend.id}">
            <h5>${friend.name}</h5>
          </a>
          <p class="text-muted">0 mutual friends</p> <!-- تقدر تعدلها لو فيه داتا -->
        </div>
      </div>
      <div class="action">
        <button class="btn btn-primary" onclick="acceptFriendRequest('${friend.id}')">
          Accept
        </button>
        <button class="btn" onclick="rejectFriendRequest('${friend.id}')">
          Decline
        </button>
      </div>
    `;

    sectionContainer.appendChild(requestDiv);
  });
}