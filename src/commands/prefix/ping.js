module.exports = {
    name: 'ping',
    usage: '`?ping` - Ping command for testing.',
    async execute(message) {
        await message.reply('Pong!');
    },
};
