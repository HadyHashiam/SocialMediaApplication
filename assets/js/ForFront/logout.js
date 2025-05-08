document.addEventListener("DOMContentLoaded", function () {
  const yesBtn = document.getElementById("logoutYes");
  const cancelBtn = document.getElementById("logoutCancel");

  if (yesBtn && cancelBtn) {
    yesBtn.addEventListener("click", async function () {
      try {
        const response = await fetch("/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({ submit: "Yes" })
        });

        const result = await response.json();

        if (result.status === "success") {
          window.location.href = "/";
        } else {
          alert("Logout failed: " + result.message);
        }
      } catch (error) {
        console.error("Error logging out:", error);
      }
    });

    cancelBtn.addEventListener("click", async function () {
      try {
        const response = await fetch("/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({ submit: "Cancel" })
        });

        const result = await response.json();

        if (result.status === "cancelled") {
          window.location.href = "/home";

          // alert("Logout cancelled"); 
        }
      } catch (error) {
        console.error("Error cancelling logout:", error);
      }
    });
  }
});
