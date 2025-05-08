const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'name required'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'email required'],
      unique: true,
      lowercase: true,
    },
    phone: String,
    image: { type: String, default: "default-user-image.png" },
    coverImage: { type: String, default: "default-user-image.png" },
    isOnline: { type: Boolean, default: false },
    friends: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        chatId: String,
      }
    ],
    friendRequests: {
      type: [{ name: String, id: Schema.Types.ObjectId, image: String }],
      default: []
    },
    sentRequests: {
      type: [{ name: String, id: Schema.Types.ObjectId, image: String }],
      default: []
    },
    // timeline includes posts id - to show in home
    timeline: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
      default: []
    },

    googleId: {
      type: String
    },
    password: {
      type: String,
      minlength: [6, 'Too short password'],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    status: {
      type: String,
      default: 'inactive',
      enum: ['active', 'inactive', 'blocked'],
    },
  },
  { timestamps: true }
);


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;



