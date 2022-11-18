const jwt = require('jsonwebtoken');

function verifyRoles(...roles){
    return (req, res, next)=>{
        console.log(req.headers.authorization.split(' ')[1]);
        const decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
        let decodedRoles = [];
        let allowedRoles = [...roles];
        for(role in decoded.roles){
            decodedRoles.push(decoded.roles[role]);
        }

        let verify;

        decodedRoles.forEach(role => {
                if(allowedRoles.includes(role)){
                    verify = [];
                    verify.push(true);
                }
        });

        console.log(decodedRoles, allowedRoles, verify);


        if(verify){
            next();
        }else{
            res.status(403).json({"unauthorized":"user unauthorized"});
        }
    }
}

module.exports = {verifyRoles};