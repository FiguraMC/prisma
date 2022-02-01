const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping command for testing.'),
    usage: '`/ping` - Ping command for testing.',
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    async execute(interaction) {
        interaction.reply('Pong!').catch(console.error);
    },
};
