const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  GetAllChats,
  GetAllChatsOfUser
} = require('./controller/chat.controller');


router.get('/', GetAllChats)
router.get('/:id', GetAllChatsOfUser)



module.exports = router;
