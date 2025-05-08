const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');


const factory = require('../../handlersFactory');
const ApiError = require('../../../../utils/apiError');
const { uploadSingleImage } = require('../../../Middlewares/uploadImageMiddleware');
const createToken = require('../../../../utils/createToken');
const User = require('../../../../models/user.Model');

// Upload single image
exports.uploadUserImage = uploadSingleImage('profileImg');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);
    // Save image into our db
    req.body.profileImg = filename;
  }
  next();
});

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

// exports.getUsers = factory.getAll(User);
// @desc    Get specific user by id
exports.getUser = factory.getOne(User);
// @desc    Create user

// @desc    update specific user
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
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

// @desc    Delete specific user
exports.deleteUser = factory.deleteOne(User);

// @desc    Get Logged user data
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
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
