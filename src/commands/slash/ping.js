const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping command for testing.'),
    usage: '`/ping` - Ping command for testing.',
    async execute(interaction) {
        interaction.reply('Pong!').catch(console.error);
    },
};
