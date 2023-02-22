const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
var { saveSetting, removeSetting } = require('../libraries/databaseMethods.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gamesroom')
		.setDescription('Use this command to define the discord channel where the bot will print the game reports')
                .addIntegerOption(option => option.setName('should_unsetup').setDescription("Pass 'true' if you want to unregister this channel as gamesroom").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
        let guildID = interaction.guildId;
        let channelID = interaction.channelId;
                let shouldUnsetup = interaction.options.getBoolean('shouldUnsetup')
                if (shouldUnsetup) {
                        removeSetting(guildID, 'gamesroom', channelID);
                } else {
                saveSetting(guildID, 'gamesroom', channelID);
                }
        await interaction.reply('This channel is now the games room.');
	},
};