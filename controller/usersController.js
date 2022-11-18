require('dotenv').config({path:'../.env'});
const usersCRUD = require('../config/db/usersCRUD');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

async function register(req,res){
    const {username, password, email} = req.body;
    if(username && password && email){
        const checkUsernameAvailability = await usersCRUD.getUser(username);
        console.log(checkUsernameAvailability);
        if(!checkUsernameAvailability){
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const user = {
                username:username,
                password:hashedPassword,
                email:email,
                roles:{
                    user:1000
                }
            }

            console.log(user);

            usersCRUD.insertUser(user).then(result => {
                if(result){
                    res.sendStatus(201);
                }else{
                    res.status(500).json({"error":"User has not been created dues to a server error"});
                }
            });

        }else{
            res.status(400).json({"error":"Username Already Exists"});
        }
    }else{
        res.status(400).json({"incorrect parameters":"Username, Password and Email address required"});
    }
}

async function logIn(req, res){
    const {username, password} = req.body;
    if(username && password){
        const foundUser = await usersCRUD.getUser(username);
        if(foundUser){
            const hashedPassword = foundUser.password;
            const match = await bcrypt.compare(password, hashedPassword);
            if(match){
                
                const refreshToken = jwt.sign(
                    {username:foundUser.username,
                    email:foundUser.email,
                    roles:foundUser.roles}, 
                    process.env.PRIVATE_KEY, 
                    {expiresIn:'1d'}
                )

                const accessToken = jwt.sign(
                    {username:foundUser.username,
                    email:foundUser.email,
                    roles:foundUser.roles},
                    process.env.PUBLIC_KEY, 
                    {expiresIn:'15m'}
                )
    
                foundUser.refreshToken = refreshToken;
                foundUser.accessToken = accessToken;

                await usersCRUD.updateUser(
                    foundUser.username, 
                    {refreshToken:refreshToken, accessToken:accessToken}
                    );

                res.cookie('jwt', refreshToken, {maxAge: 24*60*60*1000, httpOnly: true});//maxAge is in milliseconds
                res.status(200).json({"success":`Logged in as ${username}`,"accessToken":accessToken});
                /*
                200: Everything OK. Request succeeded and is defined by the HTTP method used, as with the following examples:
                GET: resource obtained and is in body of message HEAD: headers in message body 
                POST or PUT: resource describing result of the action sent in message body TRACE: message body contains request message as received
                 */

            }else{
                res.status(403).json({"error":"password wrong"});
                /* 403: Forbidden. Client lacks access rights to content; for example, may require password. */
            }
        }else{
            res.status(400).json({"error":"An account with this username does not exists"});
            /* 
            400s: Client error codes: website or page not reached; page unavailable or there was a technical problem with the request (400–499).
            */
        }
    }else{
        res.status(400).json({"incorrect parameters":"Username, Password are required for login"});
        /* 
        400s: Client error codes: website or page not reached; page unavailable or there was a technical problem with the request (400–499).
        */
    }
}

async function logOut(req,res){
    
    if(req.headers.cookie || req.body.username){
        console.log(req.body.username);
        let user;
        if(req.headers.cookie){ //if we get the cookie.
            const jwtRefreshToken = req.headers.cookie?.toString().split('=')[1];
            user = jwt.decode(jwtRefreshToken).username;
        }else{//if we don't get the cookie, we search for the username.
            user = req.body.username;
        }
        const foundUser = await usersCRUD.getUser(user);

        console.log('got the cookie:',foundUser);
        if(foundUser){
            if(foundUser.refreshToken){
                addToBlacklist({accessToken:foundUser.accessToken, refreshToken:foundUser.refreshToken, timestamp: Date.now()});
                res.status(200).json({"success":"logged out succesfully"});
            }else{
                res.status(201).json({"error":"user was already logged out"});
            }
            await usersCRUD.updateUser(foundUser.username, {refreshToken:"",accessToken:""});
        }else{
            res.status(403).json({"error":"couldn't log out properly"});
        }
    }else{
        res.status(403).json({"error":"couldn't log out properly"});
    }
}

function addToBlacklist(accesRefreshTokens){
    //https://stackoverflow.com/questions/21978658/invalidating-json-web-tokens
    //https://supertokens.com/blog/revoking-access-with-a-jwt-blacklist
    let tokens = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config','scheduler','jwtsBlackList.json')));
    let addedToken = [...tokens,accesRefreshTokens]; 
    console.log(addedToken);
    fs.writeFileSync(path.join(__dirname,'..','config','scheduler','jwtsBlackList.json'),JSON.stringify(addedToken));
}

async function refreshToken(req, res, next){
    if(req.headers.cookie){
        console.log('got the cookie:',req.headers.cookie);
        const jwtRefreshToken = req.headers.cookie?.toString().split('=')[1];
        try{
            const verifyAccessToken = jwt.verify(jwtRefreshToken, process.env.PRIVATE_KEY);
            console.log('verify access token:',verifyAccessToken);
            const foundUser = await usersCRUD.getUserByProperty({refreshToken:jwtRefreshToken});
            const decodedToken = jwt.decode(jwtRefreshToken);
            console.log(decodedToken);
            if(decodedToken.username === foundUser.username){//we verify if the user is still in the database to make sure we want to re-generate the access token,
                                                            //not really necessary but extra security
                const newAccessToken = jwt.sign(
                    {username:decodedToken.username,
                    email:foundUser.email,
                    roles:foundUser.roles},
                    process.env.PUBLIC_KEY, 
                    {expiresIn:'15m'}
                    );
                await usersCRUD.updateUser(decodedToken.username, {accessToken:newAccessToken});
                res.status(200).json({"success":`Access token generated for ${decodedToken.username}`,"accessToken":newAccessToken});
            }else{
                res.status(500).json({"error":"New token has not been generated dues to a server error"});
            }
        }catch(err){
            res.status(401).json({"error":err});
        }
    }else{
        res.status(401).json({"error":"couldn't refresh the access token, refresh token is not present"});
    }
}


async function getUsers(req,res){
    usersCRUD.getUsers().then(response => res.status(200).json(response));
}

module.exports = {getUsers, register, logIn, logOut, refreshToken};
