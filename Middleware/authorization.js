const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config('../.env');

async function checkToken(req, res, next){
    if(req.headers.authorization){
        const token = req.headers.authorization.split(' ')[1];
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

module.exports = {checkToken}