const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows the list of all AOE4 Companion commands.'),
	async execute(interaction) {
        var embedData = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: 'Help', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
            .setTimestamp()
            .setFooter({ text: 'AOE4 Companion', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
        embedData.setTitle('Commands');
        embedData.addFields(
            { name: '/signup [AOE4_PROFILE_ID]', value: 'Use this command to sign up your AOE4 profile ID in this discord server.' },
            { name: '/mystats', value: 'Using this command you will see your AOE4 ranked stats' },
            { name: '/ladder', value: 'Internal discord Ladder' },
            { name: '/teamladder', value: 'Internal discord Team Ladder' },
            { name: '/donators', value: 'List of everyone that help supporting the bot financially' },
            { name: '/contributors', value: 'List of everyone that help supporting the bot in it development' },
            { name: '\u200B', value: '\u200B' },
            { name: '/gamesroom', value: '[ADMIN COMMAND] Use this command to define the discord channel where the bot will print the game reports' },
            { name: '\u200B', value: '\u200B' }
        );
		await interaction.reply({ embeds: [embedData] });
	},
};