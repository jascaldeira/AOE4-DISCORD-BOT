const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder } = require('discord.js');
var {showLadder} = require('../libraries/mainMethods.js');
var {getAOE4PlayerLastGames} = require('../libraries/dataGetters.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('last3games')
		.setDescription('Last 3 games data'),
	async execute(interaction) {
        let userID = interaction.user.id;
        let guildID = interaction.guildId;

        var profileID = playersPerServer[guildID][userID]['aoe4_world_id'];
        var embedData = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: 'Help', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
            .setTimestamp()
            .setFooter({ text: 'AOE4 Companion', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
            .setTitle('Last 3 games data');


        getAOE4PlayerLastGames(profileID, 3).then(async function (data) {
            console.log("request")
            console.log(JSON.stringify(data.games))

            for (var game in data.games){
                console.log("dane: "+JSON.stringify(data.games[game])+"\n")
                embedData.addFields(
                    { name: 'Map:', value: data.games[game].map, inline: true }
                );
                for (var i in data.games[game].teams){
                    console.log("dane 2 : "+JSON.stringify(data.games[game].teams[i])+"\n")
                    for(var j in data.games[game].teams[i]){
                        console.log("dane 3 : "+JSON.stringify(data.games[game].teams[i][j].player.name)+"\n")
                        embedData.addFields(
                            { name: 'Name:', value: data.games[game].teams[i][j].player.name, inline: true }
                        );
                    }
                }
            } 

            
        
		await interaction.reply({ embeds: [embedData] });

        })
        
	},
};