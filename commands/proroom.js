const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
var { saveSetting, removeSetting } = require('../libraries/databaseMethods.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('proroom')
                .setDescription('Use this command to define the discord channel where the bot will print the pro game start report')
                .addBooleanOption(option => option.setName('should_unsetup').setDescription("Pass 'true' if you want to unregister this channel as proroom").setRequired(false))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
                let guildID = interaction.guildId;
                let channelID = interaction.channelId;
                let shouldUnsetup = interaction.options.getBoolean('should_unsetup')
                if (shouldUnsetup) {
                        removeSetting(guildID, 'proroom', channelID);
                        await interaction.reply('This channel will no longer be the pro room.');
                } else {
                        saveSetting(guildID, 'proroom', channelID);
                        await interaction.reply('This channel is now the pro room.');
                }
                
        },
};