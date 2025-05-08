const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // user name 
  authorname: {
    type: String,
    // required: true,
  },

  image:
  {
    type: String,
    required: false
  },
  likes: {
    likesCount: {
      type: Number,
      default: 0,
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  comments: [{
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  }],
}, { timestamps: true });


const Post = mongoose.model('Post', postSchema);
module.exports = Post;
