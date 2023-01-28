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

async function getUser(username){
    try{
        const result = await usersCollection().findOne({username:username});
        return result;
    }catch(err){
        console.error(err);
    }
}

async function getUserUnactivated(username){
    try{
        const result = await usersUnactivatedCollection().findOne({username:username});
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

async function insertUser(username){
        try{
            const result = await usersCollection().insertOne(username);
            console.log(result);
            if(result.insertedId){
                return true;
            }
        }catch(err){
            console.log(err);
        }
    }

async function insertUserUnactivated(username){
    try{
        const result = await usersUnactivatedCollection().insertOne(username);
        console.log(result);
        if(result.insertedId){
            return true;
        }
    }catch(err){
        console.log(err);
    }
}

async function updateUserUnactivated(username, properties){
    try{
        const result = await usersUnactivatedCollection().updateOne({username:username},{$set:properties});
        //pt upsert am folosi
        // ------------------------------------updateOne({username:name}, {$set:properties}, {upsert:true});
        console.log(result);
    }catch(err){
        console.error(err);
    }
}

async function updateUser(username, properties){
    try{
        const result = await usersCollection().updateOne({username:username},{$set:properties});
        //pt upsert am folosi
        // ------------------------------------updateOne({username:name}, {$set:properties}, {upsert:true});
        console.log(result);
        return result;
    }catch(err){
        console.error(err);
    }
}

// updateUser("adrian1993", {email:"test2", phoneNumber:"123", roles:{user:1000,editor:2000}});

async function deleteUserByName(username){
    try{
        const result = await usersCollection().deleteOne({username:username});
        console.log(result);
        return result;
    }catch(err){
        console.error(err);
    }
}

async function deleteUserUnactivatedByName(username){
    try{
        const result = await usersUnactivatedCollection().deleteOne({username:username});
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

async function addBookToUser(username,book){
    try{
        const result = await usersCollection().updateOne({username:username},{$push:{books:book}});
        console.log(result);
        return result;
    }catch(e){
        console.error(err);
    }
}

// addBookToUser('adrian1234',{title:"poezii", author:"eminescu"});

// updateUser('liviu',{username:'adyyo93',email:'adyyo93@gmail.com'});

module.exports = {
    getUser, 
    getUsers, 
    insertUser, 
    updateUser, 
    deleteUserByName, 
    getUserByProperty, 
    insertUserUnactivated, 
    getUserUnactivated, 
    deleteUserUnactivatedByName, 
    updateUserUnactivated,
    addBookToUser
}
