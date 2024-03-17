const router = require('express').Router();
const messageController=require('../controller/message');
const isAuth = require('../middleware/isAuth');
router.use(isAuth)
router.route('/').post(messageController.sendMessage);
router.route('/:chatId').get(messageController.getMessages);
module.exports=router