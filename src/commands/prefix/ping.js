module.exports = {
    name: 'ping',
    description: 'Ping command for testing.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        await message.reply('Pong!');
    },
};
