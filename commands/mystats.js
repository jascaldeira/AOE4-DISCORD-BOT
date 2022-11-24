const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder } = require('discord.js');
var {getAOE4WorldData} = require('../libraries/dataGetters.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mystats')
		.setDescription('Using this command you will see your AOE4 ranked stats'),
	async execute(interaction) {
        let userID = interaction.user.id;
        let guildID = interaction.guild_id;
        if (typeof playersPerServer !== 'undefined' && playersPerServer[guildID] && playersPerServer[guildID][userID] && playersPerServer[guildID][userID]['aoe4_world_id']) {
            var profileID = playersPerServer[guildID][userID]['aoe4_world_id'];
            var embedData = new EmbedBuilder()
                .setColor('#0099ff')
                .setAuthor({ name: 'Ranked stats', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
                .setTimestamp()
                .setFooter({ text: 'AOE4 Companion', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

            getAOE4WorldData(profileID).then(async function (data) {
                if (data && data.modes && (data.modes.rm_1v1 || data.modes.rm_team)) {
                    var rankString;
                    embedData.setTitle(data.name);
                    embedData.setURL(data.site_url);
                    embedData.setThumbnail(data.avatars.small);
                    var realRank;
                    
                    if (data.modes.rm_1v1) {
                        rankString = data.modes.rm_1v1.rank_level.replace('_', ' ');
                        realRank = rankString.charAt(0).toUpperCase() + rankString.slice(1);
                        embedData.addFields(
                            { name: '1v1 Rank', value: '' + data.modes.rm_1v1.rank },
                            { name: 'Current Elo', value: realRank + ' (' + data.modes.rm_1v1.rating + ')', inline: true },
                            { name: 'Highest Elo', value: '' + data.modes.rm_1v1.max_rating, inline: true },
                            { name: '\u200B', value: '\u200B' }
                        );
                    }
                    if (data.modes.rm_team) {
                        rankString = data.modes.rm_team.rank_level.replace('_', ' ');
                        realRank = rankString.charAt(0).toUpperCase() + rankString.slice(1);
                        embedData.addFields(
                            { name: 'Team Rank', value: '' + data.modes.rm_team.rank },
                            { name: 'Current Elo', value: realRank + ' (' + data.modes.rm_team.rating + ')', inline: true },
                            { name: 'Highest Elo', value: '' + data.modes.rm_team.max_rating, inline: true },
                            { name: '\u200B', value: '\u200B' }
                        );
                    }
                    
                    await interaction.reply({ embeds: [embedData] });
                } else {
                    await interaction.reply('No Ranked Details found');
                }
            }, async function (err) {
                await interaction.reply('Invalid profile ID');
            });
        } else {
            await interaction.reply('No Ranked Details found');
        }
	},
};