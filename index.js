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
    allowedMentions: {
        parse: ['users'],
    },
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

process.on('unhandledRejection', (error) => {
    const date = new Date().toISOString();
    const log = `${date} Unhandled Promise Rejection\n` +
                `${date} Error: ${error.stack}\n\n`;
    if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    fs.appendFileSync('./logs/rejection.log', log);
    console.error(log);
});

process.on('uncaughtException', (error) => {
    const date = new Date().toISOString();
    const log = `${date} Uncaught Exception\n` +
                `${date} Error: ${error.stack}\n\n`;
    if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    fs.writeFileSync(`./logs/crash-${date}.log`, log);
    console.error(log);

    process.exit(1);
});

process.on('exit', (code) => {
    const date = new Date().toISOString();
    const log = `Exit at ${date} with code ${code}\n`;
    if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    fs.appendFileSync('./logs/exit.log', log);
});
