const {format} = require('date-fns');
const {v4:uuid} = require('uuid');
const path = require('path');
const fs = require('fs');

function logMessage(message){
    const date = format(new Date(),'dd-MM-yyyy\thh:mm:ss');
    return `${date}\t${uuid()}\t${message}\n`;
}

async function log(message){
    if((fs.existsSync(path.join(__dirname,'..','Log')))){
        console.log('yes');
        await fs.promises.appendFile(path.join(__dirname,'..','Log','Log.txt'),logMessage(message));
    }else{
        await fs.promises.mkdir(path.join(__dirname,'..','Log'));
        log(message);//recurssion
    }
}

async function logRequests(req,res,next) {
    log(`${req.method}\t${req.url}`);
    console.log(`${req.method}\t${req.url}`);
    next();
}

module.exports = {logRequests};