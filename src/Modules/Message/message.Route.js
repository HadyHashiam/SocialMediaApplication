const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  GetAllMessages,
  CreateMessage,
  GetAllMessagesOfChat,
  createFilterObj,
} = require('./controller/message.controller');


router.get('/', GetAllMessages)
router.get('/:chatId', GetAllMessagesOfChat)

router.post("/:chatId", CreateMessage)


module.exports = router;
