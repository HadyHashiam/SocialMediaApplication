document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        window.location.href = '/home';
      } else {
        const data = await res.json();
        alert(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again later.');
    }
  });
});
