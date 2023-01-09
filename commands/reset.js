const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Use this command reset all subscriptions to the bot in this discord server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
                let guildID = interaction.guildId;
                playersPerServer[guildID] = {};
                await interaction.reply('This server has been reseted.');
	},
};