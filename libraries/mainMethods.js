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

    // for testing purposes
    playerData = addGeneratedTestData(playerData);

    var longestPlayerName = playerData.sort(function (a, b) {
        return b['name'].length - a['name'].length;
    }
    )[0]['name'].length;

    playerData.sort(function (a, b) {
        return b['score'] - a['score'];
    });

    var embedData = newEmbed();
    embedData.setTitle(ladderName);
    if (playerData.length > 0) {
        let playersLineByLine = '';
        for (var index in playerData) {
            if (index % maxPlayersPerEmbed == 0) {
                playersLineByLine = generateRow("#", undefined, 'Name', longestPlayerName, "Score", undefined)
            }
            playersLineByLine = playersLineByLine + generateRow((parseInt(index) + 1), undefined, playerData[index].name, longestPlayerName, playerData[index].score, undefined);
            addedPlayers = addedPlayers + 1;
            if (addedPlayers % maxPlayersPerEmbed == 0 || addedPlayers == playerData.length) {
                embedData.setDescription("```" + playersLineByLine + "```");
                playersLineByLine = '';
                if (embedsArray.length == embedArrayLimit) {
                    break;
                }
                embedsArray.push(embedData);
                embedData = newEmbed();
            }
        }
        embedsArray[embedsArray.length - 1].setTimestamp()
            .setFooter({ text: 'AOE4 Companion', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
    } else {
        embedData.addFields({ name: 'No players found', value: 'Try again later\n' });
        embedsArray.push(embedData);
    }

    //console.log('Debug embedArray:' + JSON.stringify(embedsArray));
    return embedsArray;
}

function generateRow(col1, col1MaxWidth = 4, col2, col2MaxWidth, col3, col3MaxWidth = 6) {
    let line = '';
    const space = ' ';
    line = col1 + space.repeat(cellFiller(col1, col1MaxWidth)) +
        col2 + space.repeat(cellFiller(col2, col2MaxWidth)) + ' ' +
        space.repeat(cellFiller(col3, col3MaxWidth)) + col3 + '\r\n';

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

module.exports = { showLadder, sendGamesReport };