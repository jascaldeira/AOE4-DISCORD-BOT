var {getAOE4WorldData, getAOE4PlayerLastGames} = require('./dataGetters.js');
var {updateUserData, insertGameInShareList, insertGameInUserShareList} = require('./databaseMethods.js');
const { Client, Intents, EmbedBuilder, Permissions } = require('discord.js');

async function sendGameReportsForUser(gamesroom, members, userID, userData) {
    if (userData['aoe4_world_id']) {
        let guildData = bot.guilds.cache.get(userData['discord_guild_id']);
        await getAOE4PlayerLastGames(userData['aoe4_world_id'], userData['last_game_checkup_at']).then(async function (data) {
            if (data.count > 0) {
                for (var [gameID, game] of Object.entries(data.games)) {
                    let date1 = new Date(game.updated_at);
                    let timestamp = date1.getTime();
                    if (userData['last_game_checkup_at'] === null || typeof userData['last_game_checkup_at'] == 'undefined' || parseInt(userData['last_game_checkup_at']) < timestamp) {
                        if (game.ongoing == false) {
                            var embedData = new EmbedBuilder()
                                .setColor('#0099ff')
                                .setAuthor({ name: 'Game Report', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
                                .setTimestamp()
                                .setFooter({ text: 'AOE4 Companion', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
                            let result = game.result;
                            let map = game.map;
                            let duration = game.duration;

                            let title = ':crossed_swords: ';
                            let teamsParsedData = [];
                            let gameType = 'SOLO';
                            let teamNumber = 1;
                            let sendMatchMessage = true;
                            for (var [teamID, team] of Object.entries(game.teams)) {
                                let teamName = '';
                                let teamResult = 'loss';
                                let teamValueString = '';
                                if (team.length > 1) {
                                    gameType = 'TEAM';
                                }
                                for (var [playerID, player] of Object.entries(team)) {
                                    if (teamName != '') {
                                        teamName += ' & ';
                                    }
                                    teamName += player.player.name;
                                    if (!player.player.result) {
                                        sendMatchMessage = false;
                                    }
                                    teamResult = player.player.result;
                                    let emojiData = guildData.emojis.cache.find(emoji => emoji.name == 'aoe4_' + player.player.civilization)
                                    if (emojiData) {
                                        teamValueString += '<:'+emojiData.name+':'+emojiData.id+'>';
                                    }

                                    let playerName = player.player.name;

                                    teamValueString += ((player.player.rating && player.player.rating != 'null' && player.player.rating != null) ? player.player.rating : '') + ' [' + playerName + '](https://aoe4world.com/players/' + player.player.profile_id + ')';
                                    teamValueString += '\n';
                                };
                                teamsParsedData.push({ 'name': 'Team ' + teamNumber + ' :' + ((teamResult == 'loss') ? 'red' : 'green') + '_circle:', 'valuestring': teamValueString });
                                teamNumber++;
                            };
                            title += (game.kind.substring(0, 3) == 'rm_') ? 'Ranked ' : 'Unranked ';
                            title += ' | ' + gameType + ' | ' + map;
                            title += ' :crossed_swords:';


                            embedData.setTitle(title);
                            embedData.setThumbnail("https://image.shutterstock.com/image-vector/versus-letters-vs-logo-600w-584218597.jpg");
                            embedData.addFields(
                                { name: '\u200B', value: '[:mag: View Summary](https://aoe4world.com/players/' + userData['aoe4_world_id'] + '/games/' + game.game_id + ')' },
                            );
                            teamsParsedData.forEach(function (teamData) {
                                embedData.addFields(
                                    { name: teamData.name, value: teamData.valuestring, inline: true }
                                );
                            });
                            let channel = bot.channels.cache.get(gamesroom);
                            //console.log('SENDING GAME REPORT...');
                            if (sendMatchMessage) {
                                //console.log('CHECKING IF GAME IS ALREADY IN CHANNEL...');
                                insertGameInShareList(game.game_id, gamesroom).then(function (result) {
                                    channel.send({ embeds: [embedData] });
                                    //console.log('REPORT SENT!');
                                }, function (err) { });
                            }
                        } else {
                            await reportStartingGameToUser(game, userID, userData);
                        }
                    }
                };
            }
            let currentTimestamp = new Date();
            currentTimestamp = currentTimestamp.getTime();
            updateUserData(userID, userData['discord_guild_id'], 'last_game_checkup_at', currentTimestamp);
        }, function (err) {
            //console.log(err);
        });
    }
}

async function reportStartingGameToUser(game, userID, userData) {
    var embedData = new EmbedBuilder()
        .setColor('#0099ff')
        .setAuthor({ name: 'Game Starting...', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
        .setTimestamp()
        .setFooter({ text: 'AOE4 Companion', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
    let result = game.result;
    let map = game.map;
    let duration = game.duration;

    let title = ':crossed_swords: ';
    let teamsParsedData = [];
    let gameType = 'SOLO';
    let teamNumber = 1;
    let sendMatchMessage = true;
    for (var [teamID, team] of Object.entries(game.teams)) {
        let teamName = '';
        let teamValueString = '';
        if (team.length > 1) {
            gameType = 'TEAM';
        }
        for (var [playerID, player] of Object.entries(team)) {
            if (teamName != '') {
                teamName += ' & ';
            }
            teamName += player.player.name;
            if (!player.player.result) {
                sendMatchMessage = false;
            }

            let playerName = player.player.name;
            
            let playerRating = null;
            await getAOE4WorldData(player.player.profile_id).then(function (data) {
                if (data && data.modes && data.modes[game.kind]) {
                    playerRating = data.modes[game.kind].rating
                } else if (data && data.modes && game.kind.substring(0, 3) == 'rm_') {
                    if (team.length > 1) {
                        if (data.modes['rm_team'])
                            playerRating = data.modes['rm_team'].rating
                    } else {
                        if (data.modes['rm_solo'])
                            playerRating = data.modes['rm_solo'].rating
                    }
                }
            }, function (err) {
            });
            
            teamValueString += ((playerRating != null) ? playerRating : '') + ' [' + playerName + '](https://aoe4world.com/players/' + player.player.profile_id + ')';
            teamValueString += '\n';
        };
        teamsParsedData.push({ 'name': 'Team ' + teamNumber, 'valuestring': teamValueString });
        teamNumber++;
    };
    title += (game.kind.substring(0, 3) == 'rm_') ? 'Ranked ' : 'Unranked ';
    title += ' | ' + gameType + ' | ' + map;
    title += ' :crossed_swords:';


    embedData.setTitle(title);
    embedData.setThumbnail("https://image.shutterstock.com/image-vector/versus-letters-vs-logo-600w-584218597.jpg");
    teamsParsedData.forEach(function (teamData) {
        embedData.addFields(
            { name: teamData.name, value: teamData.valuestring, inline: true }
        );
    });
    
    await insertGameInUserShareList(game.game_id, userID).then(function (result) {
        bot.users.send(userID, { embeds: [embedData] });
        //console.log('REPORT SENT!');
    }, function (err) { });
}

async function sendGamesReport(gamesroom, members) {
    if (members && gamesroom) {
        for (var [userID, userData] of Object.entries(members)) {
            await sendGameReportsForUser(gamesroom, members, userID, userData);
        };
    }
}

function showLadder(playerData, guildID) {
    let guildData = bot.guilds.cache.get(guildID);
    var ladderName = guildData.name + ' - AOE4 Ladder';
    var embedData = new EmbedBuilder()
        .setColor('#0099ff')
        .setTimestamp()
        .setFooter({ text: 'AOE4 Companion', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
        .setTitle(ladderName);

    playerData.sort(function (a, b) {
        return b['score'] - a['score'];
    });

    if (playerData.length > 0) {
        for (var index in playerData) {
            embedData.addFields({ name: (parseInt(index) + 1) + ' - ' + playerData[index].name, value: ' (Score: ' + playerData[index].score + ')' });
        }
    } else {
        embedData.addFields({ name: 'No players found', value: 'Try again later' });
    }
    embedData.addFields({ name: '\u200B', value: '\u200B' });

    return embedData;
}

module.exports = {showLadder, sendGamesReport};