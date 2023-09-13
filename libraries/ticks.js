var {sendGamesReport, sendProGamesReport} = require('./mainMethods.js');

function tick() {
}

function tentick() {
}

function sixtytick() {
    if (guildSettings) {
        //console.log('Starting game report cycle...');
        for (var [guildID, guildSetting] of Object.entries(guildSettings)) {
            if (guildSetting['gamesroom']) {
                //console.log('GOING TO CHECK FOR GAMES IN ' + guildID);
                sendGamesReport(guildSetting['gamesroom'], playersPerServer[guildID]);
            }
        };
        sendProGamesReport();
    }
}

module.exports = {tick, tentick, sixtytick};