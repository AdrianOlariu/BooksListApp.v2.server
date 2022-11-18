const cors = require('cors');

const whiteList = ['https://www.google.ro','http://127.0.0.1:56729'];

// const corsOptions = {
//     origin: 'https://www.google.ro/',
// }


//OR

const corsOptions = {
    origin: (origin, callback)=>{//the origin in the argument will be the origin of whoever requests: yoursite, google, etc!
        if(whiteList.indexOf(origin) !== -1 || !origin){//during development we let the UNDEFINED parameter in, because the origin comes as undefined
            callback(null, true);//error and allowed
        }else{
            callback(new Error('Not allowed by CORS'))
        }
    }
}

module.exports = {corsOptions, cors};