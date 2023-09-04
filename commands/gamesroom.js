const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
var { saveSetting, removeSetting } = require('../libraries/databaseMethods.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('gamesroom')
                .setDescription('Use this command to define the discord channel where the bot will print the game reports')
                .addBooleanOption(option => option.setName('should_unsetup').setDescription("Pass 'true' if you want to unregister this channel as gamesroom").setRequired(false))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
                let guildID = interaction.guildId;
                let channelID = interaction.channelId;
                let shouldUnsetup = interaction.options.getBoolean('should_unsetup')
                if (shouldUnsetup) {
                        removeSetting(guildID, 'gamesroom');
                        await interaction.reply('This channel will no longer be a  games room.');
                } else {
                        saveSetting(guildID, 'gamesroom', channelID);
                        await interaction.reply('This channel is now the games room.');
                }
                
        },
};