const booksCRUD = require('../config/db/booksCRUD');

async function populateDatabase(req,res){
    const {books} = req.body;
    booksCRUD.insertBooks(books).then(response => {
            console.log(response);
            res.sendStatus(201);
        });
}

async function getBooks(req, res){
    if(req.body.title){
        booksCRUD.getBookByTitle(req.body.title).then(result =>
            res.status(200).json(result));
    }else if(req.body.author){
        booksCRUD.getBookByAuthor(req.body.author).then(result =>{
            res.status(200).json(result);
        })
    }else{
        booksCRUD.getBooks().then(result =>{
            res.status(200).json(result);
        });
    }
}

module.exports = {populateDatabase, getBooks}

