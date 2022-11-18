const router = require('express').Router();
const usersController = require('../../controller/usersController');

router.get('/', usersController.getUsers);
router.post('/register', usersController.register);
router.post('/login', usersController.logIn);
router.delete('/logout', usersController.logOut);
router.get('/refreshToken', usersController.refreshToken);

module.exports = router;