const express = require("express");
const path = require("path");
const http = require("http");
const dotenv = require("dotenv"); dotenv.config();
const morgan = require("morgan");
const mongoose = require('mongoose');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const SessionStore = require("connect-mongodb-session")(session);
const socketIO = require("socket.io");

// dotenv.config({ path: 'config.env' });
const compression = require('compression');

const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const dbConnection = require('./config/database');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Socket.io setup
io.onlineUsers = {};
require('./sockets/friend.socket')(io)
require("./sockets/init.socket")(io);
require("./sockets/chat.socket")(io);

// io.on('connection', socket => {
//   require('./sockets/init.socket')(socket)
// })

const userRoute = require("./src/Modules/User/user.Route");
const authRoute = require("./src/Modules/Auth/auth.Route");

const PageRoute = require("./src/Pages/page.Route");
const adminRouter = require("./src/Modules/Admin/admin.route")
const postRouter = require("./src/Modules/Posts/post.Route")
const friendRouter = require("./src/Modules/Friends/friend.Route")
const messageRouter = require("./src/Modules/Message/message.Route")
const chatRouter = require("./src/Modules/Chat/chat.Route")
const commentRouter = require("./src/Modules/Comments/comment.Route")


// Connect with db
dbConnection();


app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "images")));

app.use(express.json());
app.use(cookieParser());



app.use('/images', (req, res, next) => {
  // console.log("Requested Image Path:", req.path);
  next();
}, express.static(path.join(__dirname, "images")));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


// compress all responses
app.use(compression());





// Store session
const STORE = new SessionStore({
  uri: process.env.MONGO_URL,
  collection: 'sessions'
});

// Use session
app.use(session({
  secret: 'this is my secrt to hash express session',
  saveUninitialized: false,
  resave: false,
  store: STORE,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  serializeUser: (user, done) => {
    done(null, { _id: user._id, name: user.name, email: user.email });
  }
}));


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
app.get('/', (req, res, next) => {
  res.render('welcome.ejs');
});


app.use('/', authRoute);
app.use('/', PageRoute);

app.use('/users', userRoute);
app.use('/admin', adminRouter);
app.use('/posts', postRouter);
app.use('/friend', friendRouter);
app.use('/chat', chatRouter);
app.use('/message', messageRouter);
app.use('/comment', commentRouter);

app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);


server.listen(PORT, () => {
  console.log(`App Server running on port ${PORT}`);
});

// Handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}| ${err.stack}`);
  server.close(() => {
    console.error(`Shutting down....`);
    // process.exit(1);
  });
});
