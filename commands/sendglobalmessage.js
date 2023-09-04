const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
module.exports = {
        data: new SlashCommandBuilder()
                .setName('sendglobalmessage')
                .setDescription('Use this command to send a message to all loaded guilds')
                .addStringOption(option => option.setName('input').setDescription('Text').setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
                let serverGuildID = interaction.guildId;
                let channelID = interaction.channelId;
                if (serverGuildID != 706858980877533284 || channelID != 978338409481392188) {
                        await interaction.reply('This is a special command, only usable by the bot hosting service');
                        return;
                }

                var embedData = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setAuthor({ name: 'Age of Empires IV Assistant', iconURL: 'https://i.imgur.com/AfFp7pu.png' })
                            .setTimestamp()
                            .setFooter({ text: 'Age of Empires IV Assistant', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

                embedData.setTitle('Important message!');
                embedData.setThumbnail("https://cdn-icons-png.flaticon.com/512/179/179386.png");
                embedData.setDescription(interaction.options.getString('input'));

                for (var [guildID, guildSetting] of Object.entries(guildSettings)) {
                        if ((guildSetting['gamesroom'] == 978338409481392188 && guildID == 706858980877533284) || (guildSetting['gamesroom'] == 999035587417866391 && guildID == 997619616090165409)) {
                                let channel = bot.channels.cache.get(guildSetting['gamesroom']);
                                try {
                                        await channel.send({ embeds: [embedData] });
                                } catch (error) { }
                        }
                };
                
                await interaction.reply('Massive message sent!');
        },
};