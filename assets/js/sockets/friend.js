setTimeout(() => {
  const addBtn = document.getElementById('addBtn');
  // console.log("the button after delay: ", addBtn);

  // addBtn.onclick = (e) => {
  
  //   e.preventDefault();

  //   // socket.emit("sendFriendRequest", {
  //   //   currentUserId,
  //   //   CurrentUserName,
  //   //   ParamUserId,
  //   //   CurrentUserImage,
  //   //   ParamUserName
  //   // });

  // }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      console.log("Button Clicked from JS2");
    });
  }
}, 100); // 100 ميلي ثانية تأخير، ممكن تزودها شوية لو لسه null




// const observer = new MutationObserver(() => {
//   const addBtn = document.getElementById('addBtn');
//   if (addBtn) {
//     console.log("Button found by MutationObserver");
//     console.log("the button :", addBtn)
//     addBtn.addEventListener("click", () => {
//       console.log("Button Clicked from JS2");
//     });
//     observer.disconnect(); // وقف المراقبة
//   }
// });

// observer.observe(document.getElementById("friendActionContainer"), {
//   childList: true,
//   subtree: true,
// });


