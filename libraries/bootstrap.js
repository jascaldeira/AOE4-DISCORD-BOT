var logger = require('winston');
var {tick, tentick, sixtytick} = require('./ticks.js');
const { Client, Intents, Permissions, GatewayIntentBits  } = require('discord.js');
/**
 * GLOBAL VARS
 */
 global.playersPerServer = {};
global.guildSettings = {};


/*con.connect(err => {
    // Console log if there is an error
    if (err) return //console.log(err);

    // No error found?
    //console.log(`MySQL has been connected!`);
});*/

// Configure logger settings
logger.remove(logger.transports.Console);

logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
global.bot = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

bot.login(config.token);

global.booted = false;

bot.on('guildCreate', guild => {
    con.query(`INSERT INTO guilds (discord_guild_id) VALUES ('` + guild.id + `')`, (userErr, result) => { });
});

bot.once("ready", () => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username);

    con.query(`SELECT * FROM settings`, (settingErr, settingRow) => {
        settingRow.forEach(function (setting) {
            if (!guildSettings[setting.discord_guild_id])
                guildSettings[setting.discord_guild_id] = {};
            guildSettings[setting.discord_guild_id][setting.setting_key] = setting.setting_value;
        });

        con.query(`SELECT id, discord_guild_id FROM guilds`, (guildErr, guildRow) => {
            if (guildRow.length > 0) {
                let guildLoop = 0;
                guildRow.forEach(function (guild) {
                    playersPerServer[guild.discord_guild_id] = {};
                    con.query(`SELECT id, discord_user_id, aoe4_world_id, last_game_checkup_at, discord_guild_id FROM users WHERE discord_guild_id = '` + guild.discord_guild_id + `'`, (userErr, userRow) => {
                        if (userRow.length > 0) {
                            userRow.forEach(function (user) {
                                playersPerServer[guild.discord_guild_id][user.discord_user_id] = user;
                            });
                        }
                        if (guildLoop >= guildRow.length - 1) {
                            booted = true;
                            setInterval(tick, 1000);
                            setInterval(tentick, 10000);
                            setInterval(sixtytick, 60000);
                            //console.log("Settings and Guilds loaded");
                        }
                        guildLoop++;
                    });

                });
            } else {
                booted = true;
                setInterval(tick, 1000);
                setInterval(tentick, 10000);
                setInterval(sixtytick, 60000);
                //console.log("Settings and Guilds loaded");
            }
        });
    });
});

module.exports = {playersPerServer, guildSettings, bot, booted};