const router = require('express').Router();
const booksController = require('../../controller/booksController');
const {verifyRoles} = require('../../Middleware/verifyRoles')

router.post('/', booksController.populateDatabase);

router.get('/', verifyRoles(1000), booksController.getBooks);

router.get('/title/:title', verifyRoles(1000), booksController.getBooksByTitle);
router.get('/author/:author', verifyRoles(1000), booksController.getBooksByAuthor);

module.exports = router;