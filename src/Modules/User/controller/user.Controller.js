const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const factory = require('../../handlersFactory');
const ApiError = require('../../../../utils/apiError');
const createToken = require('../../../../utils/createToken');
const User = require('../../../../models/user.Model');
const jwt = require('jsonwebtoken');

const getUserIdFromToken = (req) => {
  try {
    let token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    if (!token) throw new ApiError('No token provided', 401);
    // console.log("Extracted Token:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log("Decoded Token:", decoded);
    return decoded.userId;
  } catch (err) {
    console.error("Token verification error:", err);
    throw new ApiError('Invalid token', 401);
  }
};

exports.changeUserPhoto = asyncHandler(async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req);
    console.log("Received file:", req.file);
    console.log("Received body:", req.body);
    console.log("Received params:", req.params);
    console.log("Image type:", req.body.imageType);

    if (!req.file) {
      return next(new ApiError("Image file is required", 400));
    }

    console.log("Cloudinary public_id:", req.file.filename);
    console.log("Cloudinary URL:", req.file.url);

    const updateField = req.body.imageType === "cover" ? { coverImage: req.file.url } : { image: req.file.url };
    const document = await User.findByIdAndUpdate(userId, updateField, { new: true });

    if (!document) {
      return next(new ApiError(`No user found for id ${userId}`, 404));
    }

    const userData = document.toObject();
    userData.image = isValidUrl(document.image) ? document.image : (document.image ? `/images/${document.image}` : '/images/default.png');
    userData.coverImage = isValidUrl(document.coverImage) ? document.coverImage : (document.coverImage ? `/images/${document.coverImage}` : '/images/default_cover.png');

    res.status(200).json({ data: userData });
  } catch (error) {
    console.error("Error in changeUserPhoto:", error);
    // return next(new ApiError("Failed to change user photo", 500));
  }
});


// @desc    Get Logged user data
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});


// // exports.getUsers = factory.getAll(User);
// // @desc    Get specific user by id
// exports.getUser = factory.getOne(User);
// // @desc    Create user


const isValidUrl = (string) => {
  return string && (string.startsWith('http://') || string.startsWith('https://'));
};

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(`No user found for id ${req.params.id}`, 404));
  }

  const userData = user.toObject();

  userData.image = isValidUrl(user.image) ? user.image : (user.image ? `/images/${user.image}` : '/images/default.png');
  userData.coverImage = isValidUrl(user.coverImage) ? user.coverImage : (user.coverImage ? `/images/${user.coverImage}` : '/images/default_cover.png');

  res.status(200).json({ data: userData });
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});
























// @desc    Get list of users
exports.getUsers = asyncHandler(async (req, res, next) => {
  try {
    await factory.getAll(User, "Users")(req, res, next);
    const { documents, paginationResult } = req;
    const sortedDocuments = documents.sort((a, b) => a.code - b.code);
    res.status(200).json({
      status: 'success',
      results: sortedDocuments.length,
      paginationResult,
      products: sortedDocuments,
    });
  } catch (err) {
    console.log(err);
    next(new ApiError(`Failed to retrieve home data , ${err} `, 500));
  }
});






exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Delete specific user
exports.deleteUser = factory.deleteOne(User);



// @desc    Update specific user
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});




exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});





// @desc    Update logged user password
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  // 2) Generate token
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});




// @desc    Update logged user data (without password, role)
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );
  res.status(200).json({ data: updatedUser });
});




// // @desc    Deactivate logged user
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: 'Success' });
});
