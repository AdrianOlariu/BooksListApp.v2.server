const router = require('express').Router();
const path = require('path');

router.get('/1',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','views','subdir','somepage1.html'));
})

router.get('/2',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','views','subdir','somepage2.html'));
})

module.exports = router;