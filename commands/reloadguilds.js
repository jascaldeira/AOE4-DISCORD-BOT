const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
        data: new SlashCommandBuilder()
                .setName('reloadguilds')
                .setDescription('Use this command to reload bot loaded guilds')
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
                let guildID = interaction.guildId;
                let channelID = interaction.channelId;
                if (guildID != 706858980877533284 || channelID != 978338409481392188) {
                        await interaction.reply('This is a special command, only usable by the bot hosting service');
                        return;
                }
                
                con.query(`SELECT * FROM settings`, (settingErr, settingRow) => {
                        settingRow.forEach(function (setting) {
                                guildSettings[setting.discord_guild_id] = {};
                                guildSettings[setting.discord_guild_id][setting.setting_key] = setting.setting_value;
                        });
                });
        },
};