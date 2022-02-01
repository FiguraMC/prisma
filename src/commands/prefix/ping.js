const Discord = require('discord.js'); // eslint-disable-line no-unused-vars

module.exports = {
    name: 'ping',
    usage: '`?ping` - Ping command for testing.',
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) {
        await message.reply('Pong!');
    },
};
