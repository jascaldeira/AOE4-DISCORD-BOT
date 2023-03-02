const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
var { saveSetting } = require('../libraries/databaseMethods.js');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('gamesroom')
                .setDescription('Use this command to define the discord channel where the bot will print the game reports')
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
                let guildID = interaction.guildId;
                let channelID = interaction.channelId;
                saveSetting(guildID, 'gamesroom', channelID);
                await interaction.reply('This channel is now the games room.');
        },
};