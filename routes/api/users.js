const router = require('express').Router();
const usersController = require('../../controller/usersController');

router.get('/', usersController.getUsers);
router.post('/register', usersController.register);
router.post('/login', usersController.logIn);
router.delete('/logout', usersController.logOut);
router.get('/refreshToken', usersController.refreshToken);
router.get('/activate/:token', usersController.activateUserAccount);
router.get('/activate/:username/:token', usersController.activateUserAccount);//multiple parameters


module.exports = router;