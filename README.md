Social Site App - README
# Social Site App
A dynamic full-stack social media app where users can connect, post, chat in real time, and manage their
profiles securely. Built using Node.js, Express.js, and MongoDB. This project demonstrates backend
development, authentication, real-time communication with Socket.IO, and email integration.
## Live Demo
 View Live: https://your-live-demo-url.com
## Screenshots
1. 1.PNG - Post UI
2. 2.PNG - Friend Requests
3. 3.PNG - Profile Cover
## Features
- User authentication with session & JWT
- Google login (OAuth2)
- Profile updates (with image uploads)
- Posting, liking, commenting, and deleting posts
- Real-time 1:1 chat using Socket.IO
- Sending and managing friend requests
- Reset password functionality via email (Nodemailer)
- Email verification and secure routes
## Tech Stack
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT, bcrypt, Google OAuth2
- Real-time: Socket.IO
Page 1
Social Site App - README
- Email: Nodemailer
- File Uploads: Multer
- Frontend: HTML, CSS, Bootstrap, JavaScript
## How to Run the App
1. Clone the repository
 git clone https://github.com/HadyHashim/social-site-app.git
2. Navigate to the project folder
 cd social-site-app
3. Install all dependencies
 npm install
4. Create a .env file in the root and add the following:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BASE_URL=http://localhost:5000
5. Run the app
 node server.js
6. Open browser and visit
 http://localhost:5000
Page 2
Social Site App - README
## Project Structure
social-site-app/
 controllers/ # Route logic (posts, auth, users, chat, etc.)
 models/ # MongoDB Schemas
 routes/ # Express routers
 views/ # EJS templates
 public/
 css/
 js/
 uploads/ # Uploaded profile/post images
 utils/ # Helper functions
 middlewares/ # Auth, error, multer config
 server.js # Entry point of the server
 .env # Environment variables
## Author
Hady Hashim
GitHub: https://github.com/HadyHashim
## Contributing
Pull requests are welcome. Feel free to fork the repository and submit improvements or bug fixes.
## License
This project is open for personal and educational use.
