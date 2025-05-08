const mongoose = require('mongoose');


const messageSchema = mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String },
  image: { type: String },
  video: { type: String },
  audio: { type: String },
  file: { type: String },
}, { timestamps: true });


const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
