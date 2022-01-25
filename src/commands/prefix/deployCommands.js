const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Deploy slash commands to this guild
module.exports = {
    name: 'deploycommands',
    usage: '`?deployCommands` - Register Slash-Commands for this guild.',
    moderator: true,
    async execute(message) {
        const commands = [];
        const commandFiles = fs.readdirSync(path.join(__dirname, '../slash')).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(__dirname, `../slash/${file}`));
            commands.push(command.data.toJSON());
        }

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        rest.put(Routes.applicationGuildCommands(message.client.user.id, message.guild.id), { body: commands })
            .then(() => message.reply('Successfully registered application commands.'))
            .catch((error) => {
                console.error(error);
                message.reply('Could not register application commands.');
            });
    },
};
