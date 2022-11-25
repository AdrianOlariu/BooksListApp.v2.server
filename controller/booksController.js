const booksCRUD = require('../config/db/booksCRUD');

async function populateDatabase(req,res){
    const {books} = req.body;
    booksCRUD.insertBooks(books).then(response => {
            console.log(response);
            res.sendStatus(201);
        });
}

//!ATENTIE
//PUTEM SA LAUM DATELE FIE PRIN PARAMETRI IN BODY {author: <author_name>}; ex: getBooks
//FIE PRIN PARAMETRII IN URL: router.get('/author/:author' <function>); ex: getBooksByAuthor
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

async function getBooksByAuthor(req, res){
    const author = req.params.author;
    booksCRUD.getBookByAuthor(author).then(result => {
        res.status(200).json(result);
    })
}

async function getBooksByTitle(req, res){
    const title = req.params.title;
    booksCRUD.getBookByTitle(title).then(result =>{
        res.status(200).json(result);
    })
}

module.exports = {populateDatabase, getBooks, getBooksByAuthor, getBooksByTitle}

