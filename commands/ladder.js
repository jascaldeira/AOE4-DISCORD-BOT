const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder } = require('discord.js');
var { showLadder } = require('../libraries/mainMethods.js');
var { getAOE4WorldData } = require('../libraries/dataGetters.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ladder')
        .setDescription('Internal discord Ranked Solo Ladder.'),
    async execute(interaction) {
        let guildID = interaction.guildId;
        if (guildSetting['gamesroom'])
        if (typeof guildSettings[guildID] === 'undefined' || typeof guildSettings[guildID]['premium'] === 'undefined' || ! guildSettings[guildID]['premium']) {
            await interaction.reply('This is a premium feature! To enable this in your server, be a recurring donator (use /donators too see how to be one)');
            return;
        }
        if (typeof playersPerServer !== 'undefined' && playersPerServer[guildID]) {
            var playerData = [];
            var countParses = 0;
            await interaction.reply('Working on it');
            for (var userID in playersPerServer[guildID]) {
                var profileID = playersPerServer[guildID][userID]['aoe4_world_id'];
                getAOE4WorldData(profileID).then(async function (data) {
                    if (data && data.modes && data.modes.rm_1v1) {
                        let playerScore = data.modes.rm_1v1.rating;
                        let playerRank = data.modes.rm_1v1.rank;
                        let playerLastGame = data.modes.rm_1v1.last_game_at;
                        playerData.push({ 'name': data.name, 'score': playerScore, 'rank': playerRank, 'lastgame': playerLastGame });
                    }
                    countParses++;
                    if (countParses >= Object.keys(playersPerServer[guildID]).length) {
                        await interaction.editReply({ content: '', embeds: showLadder(playerData, guildID, "Ranked Solo Ladder") });
                    }
                }, async function (err) {
                    countParses++;
                    if (countParses >= Object.keys(playersPerServer[guildID]).length) {
                        await interaction.editReply({ content: '', embeds: showLadder(playerData, guildID, "Ranked Solo Ladder") });
                    }
                })
            };
        }
    },
};