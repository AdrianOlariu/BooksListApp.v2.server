const router = require('express').Router();
const path = require('path');

router.get('^/$|/index(.html)?',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','Views','index.html'));
})

router.get('/page1(.html)?',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','Views','page1.html'));
})

router.get('/page2(.html)?',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','Views','page2.html'));
})

module.exports = router;