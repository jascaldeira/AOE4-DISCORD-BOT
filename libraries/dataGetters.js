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

function getAOE4PlayerLastGame(profileID, since) {
    return new Promise(function (resolve, reject) {
        try {
            request('https://aoe4world.com/api/v0/players/' + profileID + '/games/last', function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    let originalData = JSON.parse(body);
                    let newData = originalData;

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

function getAOE4PlayerLastGames(profileID, since) {
    return new Promise(function (resolve, reject) {
        try {
            request('https://aoe4world.com/api/v0/players/' + profileID + '/games?limit=' + 5, function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    let originalData = JSON.parse(body);
                    let newData = originalData;

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

module.exports = {getAOE4WorldData, getAOE4PlayerLastGames, getAOE4PlayerLastGame};