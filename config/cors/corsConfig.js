const cors = require('cors');

const whiteList = ['http://brailei201.home.ro','http://brailei201.home.ro:56533'];

// const corsOptions = {
//     origin: 'https://www.google.ro/',
// }


//OR

const corsOptions = {
    origin: (origin, callback)=>{//the origin in the argument will be the origin of whoever requests: yoursite, google, etc!
        if(whiteList.indexOf(origin) !== -1 || !origin){//during development we let the UNDEFINED parameter in, because the origin comes as undefined
            callback(null, true);//error and allowed
        }else{
            callback(new Error('Not allowed by CORS'));
        }
    }
}

function accessControlAllowCredentials(req,res,next){
    //DEV:          PUT !req.headers.origin
    //PRODUCTION:   REMOVE !req.headers.origin
    if(whiteList.indexOf(req.headers.origin) !== -1 || !req.headers.origin){
        console.log('Allowed origin:', req.headers.origin);
        res.header('Access-Control-Allow-Credentials', true);
        next();
    }else{
        console.log('UNAUTHORIZED ORIGIN:', req.headers.origin);
        res.json({'Access Controll Allow Credentials':'not allowed by cors'});
    }
}

module.exports = {corsOptions, cors, accessControlAllowCredentials};