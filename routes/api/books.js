const router = require('express').Router();
const booksController = require('../../controller/booksController');
const {verifyRoles} = require('../../Middleware/verifyRoles')

router.get('/', verifyRoles(1000), booksController.getBooks);

router.post('/', booksController.populateDatabase);

module.exports = router;