const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder } = require('discord.js');
var {showLadder} = require('../libraries/mainMethods.js');
var {getAOE4WorldData} = require('../libraries/dataGetters.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ladder')
		.setDescription('Internal discord Ladder.'),
	async execute(interaction) {
        let guildID = interaction.guildId;
        if (typeof playersPerServer !== 'undefined' && playersPerServer[guildID]) {
            var playerData = [];
            var countParses = 0;
            for (var userID in playersPerServer[guildID]) {
                var profileID = playersPerServer[guildID][userID]['aoe4_world_id'];
                getAOE4WorldData(profileID).then(async function (data) {
                    if (data && data.modes && data.modes.rm_1v1) {
                        let playerScore = data.modes.rm_1v1.rating;
                        playerData.push({ 'name': data.name, 'score': playerScore });
                    }
                    countParses++;
                    if (countParses >= Object.keys(playersPerServer[guildID]).length) {
                        await interaction.reply({ embeds: [showLadder(playerData, guildID)] });
                    }
                }, async function (err) {
                    countParses++;
                    if (countParses >= Object.keys(playersPerServer[guildID]).length) {
                        await interaction.reply({ embeds: [showLadder(playerData, guildID)] });
                    }
                })
            };
        }
	},
};