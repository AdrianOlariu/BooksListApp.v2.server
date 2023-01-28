require('dotenv').config({path:'../.env'});
const usersCRUD = require('../config/db/usersCRUD');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const sendgrid = require('../config/email/sendgrid');
const fetch = require('node-fetch');

async function register(req,res){
    const {username, password, emailAddress, phoneNumber, desiredActivationMethod } = req.body;
    if(username && password && emailAddress){
        const checkUsernameAvailabilityInActivatedUsers = await usersCRUD.getUser(username);
        const checkUsernameAvailabilityInUnactivatedUsers = await usersCRUD.getUserUnactivated(username);
        console.log(checkUsernameAvailabilityInActivatedUsers, checkUsernameAvailabilityInUnactivatedUsers);
        if(!checkUsernameAvailabilityInActivatedUsers && !checkUsernameAvailabilityInUnactivatedUsers){
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const user = {
                username:username,
                password:hashedPassword,
                email:emailAddress,
                phoneNumber:phoneNumber,
                roles:{
                    user:1000
                },
                clicked:0
            }

            const activationToken = jwt.sign(
                {username:username}, 
                process.env.PRIVATE_KEY,
                {expiresIn: Math.floor(Date.now() / 1000) + (60 * 10)} 
            );

            //test activate account parameters
            //https://stackoverflow.com/questions/53892244/pass-parameter-to-node-js-api-call
            const activationLink = `${process.env.APP_URL}/users/activate/${username}/${activationToken}`;

            console.log('User registration informations',user);

            usersCRUD.insertUserUnactivated(user).then(async result => {

                if(result){
                    if(desiredActivationMethod === 'email'){
                        //compunere email
                        sendgrid.email.to = emailAddress;
                        sendgrid.email.subject = `Activate account for: ${username}`;
                        sendgrid.email.text = `Click this link to activate your account: ${activationLink}`;
                        sendgrid.email.html = `<strong>Click this link to activate your account: ${activationLink}</strong>`;
                        
                        //REACTIVATE SENDING EMAIL
                        sendgrid.client
                        .send(sendgrid.email)
                        .then(() => {
                            console.log('Email sent');
                            res.status(201).json({"message":"An email has been sent to " + emailAddress + ". Activate your account by clicking the activation link."});
                        })  
                        .catch((error) => {
                            res.status(201).json({"message":"User created but the email address with the activation link has not been sent."});
                            console.error('Email not sent',error);
                        });
                    }else if(desiredActivationMethod === 'phone'){
                        const sendSms = await fetch(`http://sms.luxartem.ro/api?`+
                        `key=${process.env.SMS_KEY}&phone=${phoneNumber}&`+
                        `text=Hello ${username}, click this link to activate your account on MyBooksList: ${activationLink}`,{method:'POST', mode: 'no-cors'});
                        console.log(sendSms);
                        if(sendSms.status.toString().includes('20')){
                            console.log('phone sms sent!');
                            sendSms.json().then(data=>console.log(data));
                            res.status(201).json({"message":"An SMS message has been sent to " + phoneNumber + ". Activate your account by clicking the activation link."});
                        }else{
                            res.status(201).json({"message":"User created but the SMS message with the activation link has not been sent."});
                        }
                    }
                }else{
                    console.log('User has not been created dues to a server error')
                    res.status(500).json({"message":"User has not been created dues to a server error"});
                }
            });
        }else{
            console.log('user already exists');
            res.status(400).json({"message":"Username Already Exists"});
        }
    }else{
        console.log('Username, Password and Email address required');
        res.status(400).json({"message":"Username, Password and Email address required"});
    }
}

async function activateUserAccount(req, res){
    //make this link with req params and make a special page for activationg users that you serve from the server
    //multiple parameters
    const username = req.params.username;
    const token = req.params.token;
    // console.log(username);
    // console.log(token);
    if(username && token){
        const unactivatedUser = await usersCRUD.getUserUnactivated(username);
        console.log(unactivatedUser);
        if(unactivatedUser){
            if(unactivatedUser.clicked == 0){
                await usersCRUD.updateUserUnactivated(username,{clicked:1});
                res.status(200).json({"message":`You are about to activate the account for the user ${username}. Please refresh this page
                or click the activation link one more time!`});
            }else{
                try {
                    const decodedToken = jwt.verify(token,process.env.PRIVATE_KEY);
                    if(decodedToken.username === username){//double verification
                        
                        await usersCRUD.deleteUserUnactivatedByName(username);
                        const activateUser = await usersCRUD.insertUser(unactivatedUser);
                        if(activateUser){
                            res.status(200).json({"message":`your account for the user ${username} has been activated`});
                            // res.status(200).sendFile(path.join(__dirname,'..','views','activate.html'));
                            // https://levelup.gitconnected.com/render-dynamic-content-in-nodejs-using-templates-a58cae681148
                            //make the activation page clickable via a button
                            //make the activation page dynamic so you can put custom fetch button
                            //for sms link, for example, the link is being clicked by a bot a presume, or something
                        }
                    }
                }catch(err) {
                    console.error(err);
                    res.status(400).json(err);
                }
            }

        }else{
            const searchUser = await usersCRUD.getUser(username);
            if(searchUser){
                res.status(302).json({"info":`User: ${username} has been already activated!`});
            }else{
                res.status(400).json({"error":"User to be activated not found!"});
            }
        }
    }else{
        res.status(400).json({"invalid activation link":"Missing parameters"});
    }
}

async function logIn(req, res){
    console.log('attempting to login');
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

                //Trimitem REFRESH_TOKEN-ul catre client(FRONT) print HTTP, intr-un COOKIE care e HTTP_ONLY, pentru a nu putea fi accesat
                //de javascript sau prin alte metode 
                //https://www.geeksforgeeks.org/http-cookies-in-node-js/
                //---------------DEV:           res.cookie('jwt', refreshToken, {httpOnly: true, sameSite:'None', maxAge: 24 * 60 * 60 * 1000});
                //---------------PRODUCTION:    res.cookie('jwt', refreshToken, {httpOnly: true, sameSite:'None', secure:true, maxAge: 24 * 60 * 60 * 1000});
                res.cookie('jwtRefreshToken', refreshToken, {httpOnly: true, sameSite:true, maxAge: 24 * 60 * 60 * 1000});//maxAge is in milliseconds
                // res.status(200).json({"success":`Logged in as ${username}`,"accessToken":accessToken});
                //trimitem accessToken-ul intr-un JSON
                //trimitem in roles, nivelul de autoritate al userului
                res.status(200).json({
                    "username": foundUser.username,
                    "accessToken": accessToken, 
                    //selectam pe baza valorii cele mai mari numele proprietatii cu acea valoare si o trimitem la client
                    "role": Object.getOwnPropertyNames(foundUser.roles)[Object.values(foundUser.roles).indexOf(Math.max(...Object.values(foundUser.roles)))]
                    });

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
            const foundUserUnactivated = await usersCRUD.getUserUnactivated(username);
            console.log(foundUserUnactivated);
            if(foundUserUnactivated){
                res.status(302).json({"message":`The ${username} account has not been activated! Activate it by visiting the link recieved!`});
            }else{
                res.status(400).json({"message":"An account with this username does not exists"});
            }
            /* 
            400s: Client error codes: website or page not reached; page unavailable or there was a technical problem with the request (400–499).
            */
        }
    }else{
        res.status(400).json({"message":"Username, Password are required for login"});
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
            const jwtRefreshToken = req.headers.cookie.toString().split('=')[1];
            user = jwt.decode(jwtRefreshToken).username;
        }else{//if we don't get the cookie, we search for the username.
            user = req.body.username;
        }
        const foundUser = await usersCRUD.getUser(user);

        console.log('got the cookie:',foundUser);
        if(foundUser){
            if(foundUser.refreshToken){
                addToBlacklist({accessToken:foundUser.accessToken, refreshToken:foundUser.refreshToken, timestamp: Date.now()});
                res.status(200).json({"message":"logged out succesfully"});
            }else{
                res.status(201).json({"message":"user was already logged out"});
            }
            await usersCRUD.updateUser(foundUser.username, {refreshToken:"",accessToken:""});
        }else{
            res.status(403).json({"message":"couldn't log out properly"});
        }
    }else{
        res.status(403).json({"message":"couldn't log out properly"});
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

async function refreshToken(req, res){
    
    if(req.headers.cookie){
        try{
            console.log('got the cookie:',req.headers.cookie);
            const jwtRefreshToken = req.headers.cookie.toString().split(';')[0].split('=')[1];
            console.log(jwtRefreshToken);
            
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
                    res.status(200).json({"message":`Access token generated for ${decodedToken.username}`,"accessToken":newAccessToken});
                }else{
                    res.status(500).json({"message":"New token has not been generated dues to a server error"});
                }
            }catch(e){
                res.status(401).json({"message":e});
            }
        
    }else{
        res.status(401).json({"message":"couldn't refresh the access token, refresh token is not present"});
    }
}


async function getUsers(req,res){
    usersCRUD.getUsers().then(response => res.status(200).json(response));
}

async function deleteUser(req, res){
    let {username} = req.query;

    const result = await usersCRUD.deleteUserByName(username);
    if(result){
        if(result.deletedCount != 0){
            console.log('deleted:',username);
            res.status(200).json({"message":`${username} deleted!`});
        }else if(result.deletedCount === 0 || !result.deletedCount){
            res.status(204).json({"message":`${username} probably doesn't exist in db!`});
        }
    }else{
        res.status(500).json({"message":"there has been a server err"});
    }
}

function generateRolesObject(array){
    let roles = {};
    for(let role of array){
        if(role === "user"){
            roles["user"] = 1000;
        }
        if(role === "editor"){
            roles["editor"] = 2000;
        }
        if(role === "admin"){
            roles["admin"] = 4000;
        }
    }
    return roles;
}


async function editUser(req, res){
    let {username, email, phone, roles, books} = req.query;
    let rolesObj = {};
    let rolesArr = [];
    
    if(roles){
        rolesArr = roles.replace(/ /g,"").split(',');
        rolesObj = generateRolesObject(rolesArr);
        console.log(rolesObj);
    }

    //dynamically building the object
    let properties = {};
    email ? properties.email = email : '';
    phone ? properties.phoneNumber = phone : '';
    
    roles ? properties.roles = rolesObj : '';
    books ? properties.books = books : '';

    console.log('properties:', properties);

    const result = await usersCRUD.updateUser(username, properties);
    console.log(result);
    if(result){
        if(result.modifiedCount != 0){
            console.log('updated:',username);
            res.status(202).json({"message":`${username} has been updated!`});
        }else if(result.modifiedCount === 0 ){
            res.status(204).json({"message":`${username} has not been updated!`});
        }
    }else{
        res.status(500).json({"message":"there has been a server err"});
    }
}

async function addBookToUserList(req, res){
    const {username, book} = req.query;
    console.log(book);
    let bookObj = JSON.parse(book);
    console.log(bookObj);
    if(!bookObj.status){
        bookObj.status = "Want to read!"
    }
    const updateUsersBooks = await usersCRUD.addBookToUser(username, bookObj);
    console.log(updateUsersBooks);
    res.status(200).json({"message":`book added to list`});
}

module.exports = {getUsers, register, logIn, logOut, refreshToken, activateUserAccount, deleteUser, editUser, addBookToUserList};
