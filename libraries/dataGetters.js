function getAOE4WorldData(profileID) {
    return new Promise(function (resolve, reject) {
        try {
            request('https://aoe4world.com/api/v0/players/' + profileID, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    return resolve(JSON.parse(body));
                }
                //console.log(error);
                reject();
            })
        } catch (err) {
            reject();
        }
    });
}

function getAOE4PlayerLastGames(profileID, since) {
    return new Promise(function (resolve, reject) {
        try {
            request('https://aoe4world.com/api/v0/players/' + profileID + '/games?limit=' + 5, function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    let originalData = JSON.parse(body);
                    let newData = originalData;

                    if (originalData.count > 0) {
                        let totalPlayers = 0;
                        let extraDataPlayers = 0;
                        for (var [gameID, game] of Object.entries(originalData.games)) {
                            for (var [teamID, team] of Object.entries(game.teams)) {
                                for (var [playerID, player] of Object.entries(team)) {
                                    totalPlayers++;
                                }
                            }
                        }
                    }

                    return resolve(originalData);
                } else {
                    //console.log(error);
                    reject();
                }
            })
        } catch (e) {
            reject()
        }
    });
}

module.exports = {getAOE4WorldData, getAOE4PlayerLastGames};