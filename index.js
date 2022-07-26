require('dotenv').config();
require('./src/util/dataStorage').load();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
// eslint-disable-next-line no-empty-function
console.ignore = () => { };

const client = new Client({
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
    partials: [
        'CHANNEL',
    ],
});

// Dialogs setup

client.dialogs = new Collection();
require('./src/dialogs/registerDialogEvents').register(client);

// Commands setup

client.cooldowns = new Collection();

client.slashCommands = new Collection();
const slashCommandFiles = fs.readdirSync('./src/commands/slash').filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
    const command = require(`./src/commands/slash/${file}`);
    client.slashCommands.set(command.data.name, command);
}

client.prefixCommands = new Collection();
const prefixCommandFiles = fs.readdirSync('./src/commands/prefix').filter(file => file.endsWith('.js'));

for (const file of prefixCommandFiles) {
    const command = require(`./src/commands/prefix/${file}`);
    client.prefixCommands.set(command.name, command);
}

// Events setup

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./src/events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(process.env.TOKEN);

process.on('unhandledRejection', error => {
    console.error(`Unhandled rejection at ${ new Date().toISOString() }\n${error.stack}\n\n`);
});

process.on('uncaughtException', error => {
    console.error(`Crash at ${ new Date().toISOString() }\n${error.stack}\n\n`);
    process.exit(1);
});
