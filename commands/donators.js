const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('donators')
		.setDescription('List of everyone that help supporting the bot financially.'),
	async execute(interaction) {
        var embedData = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: 'Donators', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
            .setTimestamp()
            .setFooter({ text: 'Please support the project using the following URL: https://www.buymeacoffee.com/jascaldeira', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
        embedData.setTitle('Donators');
        embedData.addFields(
            { name: '- ', value: '- SataNataS' }
        );
		await interaction.reply({ embeds: [embedData] });
	},
};