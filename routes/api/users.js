const router = require('express').Router();
const usersController = require('../../controller/usersController');
const authorization = require('../../Middleware/authorization');
const verifyRoles = require('../../Middleware/verifyRoles');

router.get('/', usersController.getUsers);
router.post('/register', usersController.register);
router.post('/login', usersController.logIn);
router.delete('/logout', usersController.logOut);
router.get('/refreshToken', usersController.refreshToken);
router.get('/activate/:token', usersController.activateUserAccount);
router.get('/activate/:username/:token', usersController.activateUserAccount);//multiple parameters

//admin actions on users
router.delete('/delete', authorization.checkToken, verifyRoles.verifyRoles(4000), usersController.deleteUser);
router.put('/update', authorization.checkToken, verifyRoles.verifyRoles(4000), usersController.editUser);//METHOD: PUT

router.put('/book', authorization.checkToken, verifyRoles.verifyRoles(1000), authorization.verifyIdentity, usersController.addBookToUserList);//METHOD: PUT

module.exports = router;

