require('dotenv').config({path:'../.env'});
const mongodb = require('mongodb');

const client = new mongodb.MongoClient(
    process.env.DATABASE_URI,{
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        serverApi: mongodb.ServerApiVersion.v1}
        );

const db = () => client.db(process.env.DATABASE_NAME);

const openConnection = async () => {
    try{
        const result = await client.connect();
        return result;
    }catch(err){
        console.error(err);
    }
}

const closeConnection = async() => {
    try{
        const result = await client.close();
        return result;
    }catch(err){
        console.error(err);
    }
}


module.exports = {client, db, openConnection, closeConnection};

/* - tests
async function getDatabases(){
    const databases = await client.db().admin().listDatabases();
    const dblist = databases.databases.map(db => db.name);
    return dblist;
}

openConnection().then(result => console.log('connected to db'));

setTimeout(()=>{closeConnection().then(result => console.log('connection closed'))}, 1000);
console.log();

const usersCollection = () => client.db('BOOKSAPP').collection("Users");
async function getUsers(req, res){
    
    try{
        let cursor = await usersCollection().find({});
        let result = await cursor.toArray();
        // res.json(result);
        return result;//returns a promise
    }catch(err){
        console.error(err);
    }
}

;
setTimeout(()=>{getUsers().then(result => console.log(result))}, 2000);
*/