const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Deploy slash commands to this guild
module.exports = {
    name: 'deploycommands',
    usage: '`?deployCommands` - Register Slash-Commands for this guild.',
    moderator: true,
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) {
        const commands = [];
        const commandFiles = fs.readdirSync(path.join(__dirname, '../slash')).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(__dirname, `../slash/${file}`));
            commands.push(command.data.toJSON());
        }

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        // If in dev mode
        if (process.argv[2] == 'dev') {
            // Register local application commands
            rest.put(Routes.applicationGuildCommands(message.client.user.id, message.guild.id), { body: commands })
                .then(() => message.channel.send('Successfully registered local application commands.'))
                .catch((error) => {
                    console.error(error);
                    message.reply('Could not register local application commands.');
                });
        }
        else {
            // Delete local application commands
            rest.put(Routes.applicationGuildCommands(message.client.user.id, message.guild.id), { body: [] });

            // Register global application commands
            rest.put(Routes.applicationCommands(message.client.user.id), { body: commands })
                .then(() => message.channel.send('Successfully registered global application commands.'))
                .catch((error) => {
                    console.error(error);
                    message.reply('Could not register global application commands.');
                });
        }
    },
};
