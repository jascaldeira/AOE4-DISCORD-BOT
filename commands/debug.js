const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('debug')
		.setDescription('Use this command to gather some information about the bot and the server')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		let guildID = interaction.guildId;
		let channelID = interaction.channelId;
		await interaction.reply('GuildID: ' + guildID + ' - ChannelId: ' + channelID);
	},
};