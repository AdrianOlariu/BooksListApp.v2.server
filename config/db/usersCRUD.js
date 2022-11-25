require('dotenv').config({path:'../.env'});
const mongodb = require('./mongodb');

console.log(process.env.DATABASE_NAME);

const usersCollection = () => mongodb.client.db('BOOKSAPP').collection("Users");
const usersUnactivatedCollection = () => mongodb.client.db('BOOKSAPP').collection("Users_unactivated");

async function getUsers(){
    try{
        let cursor = await usersCollection().find({});
        let result = await cursor.toArray();
        return result;//returns a promise
    }catch(err){
        console.error(err);
    }
}

async function getUser(name){
    try{
        const result = await usersCollection().findOne({username:name});
        return result;
    }catch(err){
        console.error(err);
    }
}

async function getUserUnactivated(name){
    try{
        const result = await usersUnactivatedCollection().findOne({username:name});
        return result;
    }catch(err){
        console.error(err);
    }
}

async function getUserByProperty(property){
    try{
        const result = await usersCollection().findOne(property);
        return result;
    }catch(err){
        console.error(err);
    }
}

async function insertUser(user){
        try{
            const result = await usersCollection().insertOne(user);
            console.log(result);
            if(result.insertedId){
                return true;
            }
        }catch(err){
            console.log(err);
        }
    }

async function insertUserUnactivated(user){
    try{
        const result = await usersUnactivatedCollection().insertOne(user);
        console.log(result);
        if(result.insertedId){
            return true;
        }
    }catch(err){
        console.log(err);
    }
}

async function updateUser(name, properties){
    try{
        const result = await usersCollection().updateOne({username:name},{$set:properties});
        //pt upsert am folosi
        // ------------------------------------updateOne({username:name}, {$set:properties}, {upsert:true});
        console.log(result);
    }catch(err){
        console.error(err);
    }
}

async function deleteUserByName(name){
    try{
        const result = await usersCollection().deleteOne({username:name});
        console.log(result);
    }catch(err){
        console.error(err);
    }
}

async function deleteUserUnactivatedByName(name){
    try{
        const result = await usersUnactivatedCollection().deleteOne({username:name});
        console.log(result);
    }catch(err){
        console.error(err);
    }
}

async function deleteUserByEmail(email){
    try{
        const result = await usersCollection().deleteOne({email:email});
        console.log(result);
    }catch(err){
        console.error(err);
    }
}

// updateUser('liviu',{username:'adyyo93',email:'adyyo93@gmail.com'});

module.exports = {getUser, getUsers, insertUser, updateUser, deleteUserByName, getUserByProperty, insertUserUnactivated, getUserUnactivated, deleteUserUnactivatedByName}
