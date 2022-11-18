const cron = require('cron');
const fs = require('fs');
const path = require('path');

//how to use it
// second         0-59
// minute         0-59
// hour           0-23
// day of month   0-31
// month          0-12 (or names, see below)
// day of week    0-7 (0 or 7 is Sun, or use names)
// * * * * * *      second | minute | hour day of month | month | day of week
// * 10 * * * *     once, ten minutes from now
// * */10 * * * *   every ten minutes


function cleanUpBlackList(){
    const blackList = JSON.parse(fs.readFileSync(path.join(__dirname,'jwtsBlackList.json')).toString());

    let updatedList = [];
    for(let i = 0; i < blackList.length; i++){
            //calculam cat a trecut de cand au fost adaugate timestamp-urile respective
            if((Date.now() - blackList[i].timestamp) < 15 * 60 * 1000){
                //(timestamp'ul prezent - timestamp'ul la momentul creerii) < minute * 60(secunde) * 1000 (deoarece timestamp-ul este in milisecunde) 
                updatedList.push(blackList[i]);//adaugam in noua lista numai token-urile ce inca nu au expirat.
            }
    };

    console.log(updatedList);
    fs.writeFileSync(path.join(__dirname,'jwtsBlackList.json'),JSON.stringify(updatedList));
}

const jobCleanUpBlackList = cron.job('0 */15 * * * *', ()=>{
    cleanUpBlackList();
    console.log("Current time:", Date.now());
});

function startScheduledTasks(){
    jobCleanUpBlackList.start();
}



module.exports = {startScheduledTasks};