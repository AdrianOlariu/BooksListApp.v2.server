const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const usersCRUD = require('../config/db/usersCRUD');
require('dotenv').config('../.env');

async function checkToken(req, res, next){
    if(req.headers.authorization){
        const token = req.headers.authorization.split(' ')[1];
        console.log("access token from checkToken:",token);
        if(!isTokenOnBlackList(token)){
            try{
                const verifyAccessToken = jwt.verify(token, process.env.PUBLIC_KEY);
                if(verifyAccessToken){
                    next();
                }
            }catch(err){
                console.error(err)
                res.status(403).json({"unauthorized":err});
            }
        }else{
            res.status(403).json({"unauthorized":"access token invalid"});
        }
    }else{
        res.status(403).json({"unauthorized":"access token not present"});
    }
}

async function verifyIdentity(req, res, next){
    const {username} = req.query;
    const token = req.headers.authorization.split(' ')[1];
    console.log("access token from verifyIdentity:",token);
    const userData = await usersCRUD.getUser(username);
    console.log("user data:", userData);
    if(userData.accessToken === userData.accessToken){
        next();
    }else{
        res.status(409).json({"message":`The username ${username} may not be authorized to make the changes it is trying to make on this account or maybe you are using an old access token!
        If the second argument apply, log out and log back in order to reset the access token!`})
    }
}

function isTokenOnBlackList(token){
    const tokens = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config','scheduler','jwtsBlackList.json')));
    console.log(tokens);
    const verify = tokens.find(current => current.accessToken === token);
    if(verify){
        return true;
    }else{
        return false;
    }
}

module.exports = {checkToken, verifyIdentity}