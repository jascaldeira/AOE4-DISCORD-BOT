var { getAOE4WorldData, getAOE4PlayerLastGame } = require('./dataGetters.js');
var { updateUserData, insertGameInShareList, insertGameInUserShareList } = require('./databaseMethods.js');
const { Client, Intents, EmbedBuilder, Permissions } = require('discord.js');

async function sendGameReportsForUser(gamesroom, members, userID, userData) {
    if (userData['aoe4_world_id']) {
        let guildData = bot.guilds.cache.get(userData['discord_guild_id']);
        if (!guildData)
            return;
        await getAOE4PlayerLastGame(userData['aoe4_world_id'], userData['last_game_checkup_at']).then(async function (data) {
            if (data.game_id > 0) {
                let game = data;
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
                                teamName += player.name;
                                if (!player.result) {
                                    sendMatchMessage = false;
                                }
                                teamResult = player.result;
                                let emojiData = guildData.emojis.cache.find(emoji => emoji.name == 'aoe4_' + player.civilization)
                                if (emojiData) {
                                    teamValueString += '<:' + emojiData.name + ':' + emojiData.id + '>';
                                }

                                let playerName = player.name;

                                teamValueString += ((player.rating && player.rating != 'null' && player.rating != null) ? player.rating : '') + ' [' + playerName + '](https://aoe4world.com/players/' + player.profile_id + ')';
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
                            await insertGameInShareList(game.game_id, gamesroom).then(async function (result) {
                                try {
                                    await channel.send({ embeds: [embedData] });
                                } catch (error) { }
                                //console.log('REPORT SENT!');
                            }, function (err) { });
                        }
                    } else {
                        await reportStartingGameToUser(game, userID, userData);
                    }
                }
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
            teamName += player.name;
            if (!player.result) {
                sendMatchMessage = false;
            }

            let playerName = player.name;

            let playerRating = null;
            await getAOE4WorldData(player.profile_id).then(function (data) {
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

            teamValueString += ((playerRating != null) ? playerRating : '') + ' [' + playerName + '](https://aoe4world.com/players/' + player.profile_id + ')';
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
        bot.users.send(userID, { embeds: [embedData] }).catch(error => { });
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

function showLadder(playerData, guildID, ladderType) {
    const maxPlayersPerEmbed = 10;
    const embedArrayLimit = 10;
    let addedPlayers = 0;
    let guildData = bot.guilds.cache.get(guildID);
    let ladderName = guildData.name + ' ' + ladderType;
    let embedsArray = [];

    var longestPlayerName = playerData.sort(function (a, b) {
        return b['name'].length - a['name'].length;
    }
    )[0]['name'].length;

    playerData.sort(function (a, b) {
        if (typeof b['score'] === 'undefined')
		    b['score'] = 0;

        if (typeof a['score'] === 'undefined')
            a['score'] = 0;

        return b['score'] - a['score'];
    });

    var embedData = newEmbed();
    embedData.setTitle(ladderName);
    embedData.setThumbnail("https://www.pngall.com/wp-content/uploads/5/Gold-Trophy-PNG.png");
    if (playerData.length > 0) {
        let playersLineByLine = '';
        let titleLine = '';
        let first = true;
        let embedInserted = false;
        let removedPlayers = 0;
        let playersAdded = false;
        for (var index in playerData) {
            if (addedPlayers % maxPlayersPerEmbed == 0) {
                titleLine = '';
                if (first) {
                    titleLine = 'Players who have not played for more than 15 days will be removed from the Ladder. \r\n \r\n';
                }
                playersLineByLine = generateRow("#", undefined, 'Player', longestPlayerName + 2, "Rank", undefined, "Elo", undefined, "Last game", undefined);
                first = false;
            }
            let timeAgoValue = timeAgo(playerData[index].lastgame);

            if (timeAgoValue.secondsDiff < 1296000) {
                playersLineByLine = playersLineByLine + generateRow((parseInt(addedPlayers) + 1), undefined, playerData[index].name, longestPlayerName + 2, playerData[index].rank, undefined, playerData[index].score, undefined, timeAgoValue.translated, undefined);
                addedPlayers = addedPlayers + 1;
                playersAdded = true;
            } else {
                removedPlayers = removedPlayers + 1;
            }
            if ((addedPlayers % maxPlayersPerEmbed == 0 || addedPlayers == (playerData.length - removedPlayers)) && playersAdded) {
                embedData.setDescription(titleLine + "```" + playersLineByLine + "```");
                playersLineByLine = '';
                playersAdded = false;
                if (embedsArray.length == embedArrayLimit) {
                    break;
                }
                embedsArray.push(embedData);
                embedData = newEmbed();
                embedInserted = true;
            }
        }
        if (embedInserted) {
            embedsArray[embedsArray.length - 1].setTimestamp()
                .setFooter({ text: 'AOE4 Companion', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
        } else {
            embedData.addFields({ name: 'No players found', value: 'Try again later\n' });
            embedsArray.push(embedData);
        }
    } else {
        embedData.addFields({ name: 'No players found', value: 'Try again later\n' });
        embedsArray.push(embedData);
    }

    //console.log('Debug embedArray:' + JSON.stringify(embedsArray));
    return embedsArray;
}

function generateRow(col1, col1MaxWidth = 4, col2, col2MaxWidth = 6, col3, col3MaxWidth = 6, col4, col4MaxWidth = 5, col5, col5MaxWidth = 14) {
    if (col2MaxWidth > 18) {
        col2MaxWidth = 18;
        col2 = col2.substring(0, col2MaxWidth - 2);
    }
        
    let line = '';
    const space = ' ';
    line = col1 + space.repeat(cellFiller(col1, col1MaxWidth)) +
        col2 + space.repeat(cellFiller(col2, col2MaxWidth)) + ' ' +
        col3 + space.repeat(cellFiller(col3, col3MaxWidth)) + ' ' +
        col4 + space.repeat(cellFiller(col4, col4MaxWidth)) + ' ' +
        space.repeat(cellFiller(col5, col5MaxWidth)) + col5 + '\r\n';

    return line;
}

function cellFiller(input, maxColumnWidth) {
    input = input + '';
    let emptySpacesNeeded = maxColumnWidth - input.length;
    return emptySpacesNeeded;
}

function newEmbed() {
    let embedData = new EmbedBuilder()
        .setColor('#0099ff');
    return embedData;
}

function timeAgo(datetime) {
    let date = new Date(datetime);
    var curdate = new Date();
    let timestampSeconds = Math.floor(date.getTime() / 1000);
    let curTimestampSeconds = Math.floor(curdate.getTime() / 1000);

    let diffInSeconds = (curTimestampSeconds - timestampSeconds);

    let translation = '';

    if (diffInSeconds < 3600) {
        translation = Math.floor(diffInSeconds / 60) + ' Minutes ago';
    } else if (diffInSeconds < 86400) {
        translation = Math.floor(diffInSeconds / 60 / 60) + ' Hours ago';
    } else {
        translation = Math.floor(diffInSeconds / 60 / 60 / 24) + ' Days ago';
    }

    return {
        'secondsDiff': diffInSeconds,
        'translated': translation
    };
}

module.exports = { showLadder, sendGamesReport };