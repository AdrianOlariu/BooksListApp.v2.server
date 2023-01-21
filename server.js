require('dotenv').config();
const {logRequests} = require('./Middleware/logging');
const path = require('path');
const express = require('express');
const app = require('express')();//curry function like
const port = process.env.PORT || 3500;
const mongodb = require('./config/db/mongodb');
const authorization = require('./Middleware/authorization');
const coockieParser = require('cookie-parser');
const corsConfig = require('./config/cors/corsConfig');
const cron = require('./config/scheduler/cron');

cron.startScheduledTasks();

app.use('/',express.static(path.join(__dirname,'public')));
app.use('/', require('./routes/views'));
app.use('/', require('./routes/subdir'));
app.use('^/$|/index(.html)?',(req,res)=>{    
        res.sendFile(path.join(__dirname,'views','index.html'));
})

app.use(corsConfig.accessControlAllowCredentials);
app.use(corsConfig.cors(corsConfig.corsOptions));

app.use(logRequests);
app.use(coockieParser());
app.use(express.json());
app.use('/users', require('./routes/api/users'));

app.use(authorization.checkToken);
app.use('/books', authorization.checkToken, require('./routes/api/books'));

app.all('/*|*',(req,res)=>{
    if(req.accepts('html')){
        res.status(404).sendFile(path.join(__dirname,'views','404.html'));
    }else if(req.accepts('json')){
        res.status(404).json({"error":"route does not exist"});
    }else{
        res.status(404).type('txt').send("404 Not Found");
    }
})



mongodb.openConnection().then(result => {  
    console.log(`Connected to database ${process.env.DATABASE_NAME}`);
    app.listen(port, (err)=>{
        if(err){
            console.error(err);
        }else{
            console.log(`Server started on port ${port}`);
        }
    });
})

/*
TO ADD:

-CORS - DONE
-USER ROLES - DONE
-DELETE EVERY 15 MIN ALL THE REFRESH/ACCESS TOKENS OLDER THAN 15 MINUTES - DONE

-EMAIL LINK VERIFICATION AFTER REGISTRATION !!!

-PUT THE API ONLINE
-MAKE A FRONT END FOR IT
-START LEARNING TYPESCRIPT!
*/

//I sat right there, in my eyes flares
//As I was gazing upon the hall
//Just felt like walkin on a lava floor
//And going straight into mordor
