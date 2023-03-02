const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('contributors')
		.setDescription('List of everyone that help supporting the bot in it development.'),
	async execute(interaction) {
        var embedData = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: 'Contributors', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
            .setTimestamp()
            .setFooter({ text: 'Please support the project using the following URL: https://github.com/jascaldeira/AOE4-DISCORD-BOT', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
        embedData.setTitle('Contributors');
        embedData.addFields(
            { name: '- ', value: '- Caldeira\n- PM303\n- donPabloM' }
        );
		await interaction.reply({ embeds: [embedData] });
	},
};