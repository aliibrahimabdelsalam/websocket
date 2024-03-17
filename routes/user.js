const router = require('express').Router();
const userController = require('../controller/user');
const isAuth=require('../middleware/isAuth')
router.use(isAuth)
router.route('/').get(userController.getUsers).post(userController.createUser)
router.route("/:id").patch(userController.updateUser)
    .delete(userController.deleteUser)
    .get(userController.getOneUser)
module.exports=router