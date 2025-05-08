// to initialize socket Connect 
const socket = io()
let id = document.getElementById('currentUserId').value;

socket.on('connect', () => {
  // console.log('Socket connected with ID:', id);
  socket.emit('joinNotificationsRoom', id);
  socket.emit("goOnline", id);
  console.log('Connected to socket server from init.js and Go Online', id);


})


socket.on("newFriendRequest", data => {
  console.log("data from on in newFriendRequest Event :", data);

  setTimeout(() => {
    const friendRequestsList = document.getElementById('friendRequestsList');
    const noFriendRequest = document.getElementById('no-friend-request');
    if (noFriendRequest) {
      noFriendRequest.remove();
    }
    const requestItem = document.createElement('div');
    requestItem.classList.add('dropdown-item');
    requestItem.setAttribute('data-id', data.currentUserId);
    requestItem.innerHTML = `
      <div style="display: flex; align-items: center;">
        <img src="${data.image}" alt="${data.name}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;">
        <a href="/profile/${data.id}"> ${data.name}</a>
      </div>
      <div style="margin-top: 5px;">
        <button class="btn btn-success btn-sm accept-btn" onclick="acceptFriendRequest('${data.id}')">Accept</button>
        <button class="btn btn-danger btn-sm reject-btn" onclick="rejectFriendRequest('${data.id}')">Reject</button>
      </div>
    `;

    const btn = document.getElementById('friendRequestsDropdown');
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-danger");

    // 👇 نضيف الـ Event Listener هنا عشان أول مرة المستخدم يضغط يرجّع اللون
    const handleBtnClick = () => {
      btn.classList.remove("btn-danger");
      btn.classList.add("btn-primary");

      // بعد أول ضغط نلغي الليسنر عشان ما يضيفش مرتين لو جت طلبات كتير
      btn.removeEventListener("click", handleBtnClick);
    };

    btn.addEventListener("click", handleBtnClick);

    friendRequestsList.appendChild(requestItem);
  }, 100);
});





// async function handleFriendRequest(friendId, isAccepted) {
//   const action = isAccepted ? 'accepted' : 'rejected';

//   try {
//     let response;
//     if (isAccepted) {
//       response = await fetch(`/friend/acceptFriendRequest`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ requestId: friendId }),
//       });
//     } else {
//       response = await fetch(`/friend/reject`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ requestId: friendId }),
//       });
//     }

//     if (response.ok) {
//       console.log(`Friend request from ID ${friendId} was ${action}`);

//       // Remove the item from the dropdown menu
//       const itemToRemove = document.querySelector(`.dropdown-item[data-id="${friendId}"]`);
//       if (itemToRemove) {
//         itemToRemove.remove(); // Remove the element from the dropdown
//       }

//       // Reset the dropdown button color
//       const btn = document.getElementById('friendRequestsDropdown');
//       btn.classList.remove("btn-danger");
//       btn.classList.add("btn-primary"); // أو استخدم اللون الذي تريد
//     } else {
//       console.error('Failed to process friend request');
//     }
//   } catch (error) {
//     console.error("Error processing friend request:", error);
//   }
// }


