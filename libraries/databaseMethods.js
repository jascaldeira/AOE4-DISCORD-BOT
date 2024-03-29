function saveSetting(guild_id, key, value) {
    if (!guildSettings[guild_id])
        guildSettings[guild_id] = {};
    guildSettings[guild_id][key] = value;
    con.query(`INSERT INTO settings (discord_guild_id, setting_key, setting_value) VALUES (` + guild_id + `, '` + key + `', '` + value + `') ON DUPLICATE KEY UPDATE setting_value='` + value + `'`, (err, result) => { });
}

function removeSetting(guild_id, key) {
    if (!guildSettings[guild_id])
        guildSettings[guild_id] = {};
    if (guildSettings[guild_id] && guildSettings[guild_id][key]) {
        delete guildSettings[guild_id][key];
    }
    con.query(`DELETE FROM settings WHERE discord_guild_id = ${guild_id} AND setting_key = '${key}'`, (err, result) => { });
}

function getSetting(guild_id, key) {
    if (!guildSettings[guild_id])
        guildSettings[guild_id] = {};

    if (guildSettings[guild_id] && guildSettings[guild_id][key]) {
        return guildSettings[guild_id][key];
    }
    return null;
}

function updateUserData(userID, guildID, field, value) {
    playersPerServer[guildID][userID][field] = value;
    con.query(`INSERT INTO users (discord_user_id, discord_guild_id, ` + field + `) VALUES (` + userID + `, ` + guildID + `, '` + value + `') ON DUPLICATE KEY UPDATE ` + field + `='` + value + `'`, (userErr, result) => { });
}


function updateProData(userID, field, value) {
    proPlayers[userID][field] = value;
    con.query(`UPDATE proplayers SET ` + field + ` = '` + value + `' WHERE (aoe4_world_id = '` + userID+ `');`, (userErr, result) => { });
}

function insertGameInShareList(gameID, channelID) {
    return new Promise(function (resolve, reject) {
        checkIfGameWasShared(gameID, channelID).then(function (result) {
            //console.log('GAME ALREADY SHARED!');
            reject();
        }, function (err) {
            //console.log('ADDING GAME TO SHARED LIST...');
            con.query(`INSERT INTO games_shared (game_id, discord_channel_id) VALUES ('` + gameID + `', '` + channelID + `')`, (userErr, result) => {
                return resolve();
            });
        });
    });
}

function insertGameInUserShareList(gameID, userId) {
    return new Promise(function (resolve, reject) {
        checkIfGameWasSharedToUser(gameID, userId).then(function (result) {
            //console.log('GAME ALREADY SHARED!');
            reject();
        }, function (err) {
            //console.log('ADDING GAME TO SHARED LIST...');
            con.query(`INSERT INTO games_shared_to_user (game_id, user_id) VALUES ('` + gameID + `', '` + userId + `')`, (userErr, result) => {
                return resolve();
            });
        });
    });
}

function checkIfGameWasShared(gameID, channelID) {
    return new Promise(function (resolve, reject) {
        con.query(`SELECT id FROM games_shared WHERE discord_channel_id = '` + channelID + `' AND game_id = '` + gameID + `'`, (userErr, userRow) => {
            if (userRow.length > 0) {
                return resolve();
            }
            reject();
        });
    });
}

function checkIfGameWasSharedToUser(gameID, userId) {
    return new Promise(function (resolve, reject) {
        con.query(`SELECT id FROM games_shared_to_user WHERE user_id = '` + userId + `' AND game_id = '` + gameID + `'`, (userErr, userRow) => {
            if (userRow.length > 0) {
                return resolve();
            }
            reject();
        });
    });
}

module.exports = { getSetting, saveSetting, removeSetting, updateUserData, updateProData, insertGameInShareList, insertGameInUserShareList };