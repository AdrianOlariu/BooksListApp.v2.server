const mongodb = require('./mongodb');

const booksCollection = () => mongodb.client.db('BOOKSAPP').collection('Books');

async function insertBooks(books){
    const result = await booksCollection().insertMany(books);
    return result;
}

async function getBookByTitle(title){
    try{
        const result = await booksCollection().findOne({"title":title});
        return result;
    }catch(err){
        console.error(err);
    }
}

async function getBookByAuthor(author){
    try{
        const cursor = await booksCollection().find({"author":author});
        let result = await cursor.toArray();
        return result;
    }catch(err){
        console.error(err);
    }
}

async function getBooks(){
    try{
        const cursor = await booksCollection().find();
        let result = await cursor.toArray();
        return result;
    }catch(err){
        console.error(err);
    }
}

module.exports = {insertBooks, getBooks, getBookByTitle, getBookByAuthor};