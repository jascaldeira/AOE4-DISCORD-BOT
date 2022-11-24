const fs = require('node:fs');
const path = require('node:path');
var {getAOE4WorldData} = require('./dataGetters.js');
var {saveSetting} = require('./databaseMethods.js');
var {showLadder} = require('./mainMethods.js');
const { Client, Intents, EmbedBuilder, Permissions, Collection, REST, Routes, Events } = require('discord.js');

bot.commands = new Collection();

/**
 * 
 * 
 * Read the commands:
 * 
 * 
 */
const commands = [];
const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
    commands.push(command.data.toJSON());
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		bot.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

/**
 * 
 * 
 * Deploy the commands:
 * 
 * 
 */
// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(config.token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(config.clientId),
			{ body: commands }
		).then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

bot.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});