const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../../../../models/user.Model');
const ApiError = require('../../../../utils/apiError');
const createToken = require('../../../../utils/createToken');
const sendEmail = require('../../../../utils/sendEmail');

// @desc    post Signup
// @route   post /api/auth/signup
// @access  Public
exports.postSignup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // 2- Generate token
  const token = createToken(user._id);
  res.status(201).json({ data: user, token })
});


// @desc    postLogin
// @route   post /api/auth/login
// @access  Public
exports.postlogin = asyncHandler(async (req, res, next) => {
  // 1) Validate email and password
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect email or password', 401));
  }
  try {
    // 2) clear old cookies
    res.clearCookie("token");
    // generate new token
    const token = createToken(user._id);
    // create session 
    req.session.regenerate((err) => {
      if (err) {
        return next(new ApiError('Session regeneration failed', 500));
      }
      // save data into session    in Req  (Request)
      req.session.user = user;
      req.session.token = token;
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ data: user, token });
    });
  } catch (err) {
    return next(new ApiError('Unexpected error during login', 500));
  }
});



exports.PostLogout = asyncHandler(async (req, res, next) => {
  console.log('logout open');
  let valueOfsubmit = req.body.submit;

  if (valueOfsubmit === "Yes") {
    console.log("yes");

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ status: 'error', message: 'Failed to log out' });
      }

      res.clearCookie('token', { path: '/', httpOnly: true, sameSite: 'None', secure: true });
      res.clearCookie('connect.sid', { path: '/', httpOnly: true, sameSite: 'None', secure: true });
      return res.status(200).json({ status: 'success', message: 'Logged out successfully' });
    });

  } else if (valueOfsubmit === "Cancel") {
    return res.status(200).json({ status: 'cancelled', message: 'Cancelled logout' });
  }
});


exports.TestCookie = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("req.session.user :", req.session.user)
    console.log("req.headers.cookie :", req.headers.cookie)
    if (!token) {
      return res.status(401).json({ message: 'No token found in cookies' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userId;
    res.json({ message: 'Token is valid', userId, token: token });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
})


// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies if not found in headers
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }
  // Check if user is logged in with Google and generate
  if (req.session && req.session.passport && req.session.passport.user) {
    req.user = req.session.passport.user;
    return next();
  }
  if (!token) {
    return next(
      new ApiError(
        'You are not logged in. Please log in to get access to this route.',
        401
      )
    );
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(
      new ApiError(
        'Invalid token. Please log in again.',
        401
      )
    );
  }

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        'The user that belongs to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after token was issued
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          'User recently changed their password. Please log in again.',
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});






// @desc    Authorization (User Permissions)
["admin"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 403)
      );
    }
    next();
  });




// @desc    Forgot password
// @route   POST /api/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 3) Send the reset code via email
  const message = `Hi ${user.name},\n We received a request to reset the password Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset code (valid for 10 min)',
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError('There is an error in sending email', 500));
  }

  res
    .status(200)
    .json({ status: 'Success', message: 'Reset code sent to email' });
});



// @desc    Verify password reset code
// @route   POST /api/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError('Reset code invalid or expired'));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: 'Success',
  });
});







// @desc    Reset password
// @route   POST /api/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError('Reset code not verified', 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});





