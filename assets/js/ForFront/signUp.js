// form validation
document.addEventListener("DOMContentLoaded", function () {
  const signUpButton = document.getElementById("signUpButton");
  const form = document.getElementById("signupForm");

  signUpButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default form submission
    if (validateForm()) {
      // If the form is valid, submit it
      form.submit();
    }
  });

  function validateForm() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmpassword").value;

    // Simple validation for required fields
    if (name === "" || email === "" || password === "" || confirmPassword === "") {
      alert("All fields are required.");
      return false;
    }

    // Name lenght validation
    if (name.length < 3) {
      alert("Name must be at least 3 charachters long.")
      return false;
    }

    // Password length validation
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return false;
    }

    // Password confirmation check
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.match(emailRegex)) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  }
});
