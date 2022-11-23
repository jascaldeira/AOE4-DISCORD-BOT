const { Client, Intents, EmbedBuilder, Permissions, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('signup')
		.setDescription('Use this command to sign up your AOE4 profile ID in this discord server.')
        .addIntegerOption(option => option.setName('aoe4_profile_id').setDescription('Your AOE4World.com ID').setRequired(true)),
	async execute(interaction) {
        let userID = interaction.user.id;
        let guildID = interaction.guild_id;
        if (typeof playersPerServer[guildID] == 'undefined') {
            playersPerServer[guildID] = {};
        }

        let currentTimestamp = new Date();
        currentTimestamp = currentTimestamp.getTime();

        playersPerServer[guildID][userID] = { "discord_user_id": userID, "aoe4_world_id": interaction.options.getInteger('aoe4_profile_id'), "discord_guild_id": guildID, "last_game_checkup_at": currentTimestamp };
        var sanitizedAOE4WorldID = sanitizer.value(interaction.options.getInteger('aoe4_profile_id'), 'int');

        con.query(`INSERT INTO users (discord_user_id, aoe4_world_id, discord_guild_id, last_game_checkup_at) VALUES (` + userID + `, '` + sanitizedAOE4WorldID + `', '` + guildID + `', '` + currentTimestamp + `') ON DUPLICATE KEY UPDATE aoe4_world_id='` + sanitizedAOE4WorldID + `'`, (userErr, result) => { });

        await interaction.reply('Thank you for your registration!');
	},
};