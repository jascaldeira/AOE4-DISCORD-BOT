function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sleepFor(sleepDuration){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ 
        /* Do nothing */ 
    }
}

module.exports = {sleep, sleepFor};