const { SlashCommandBuilder } = require('@discordjs/builders');
const got = require('got');

module.exports = {
    name: 'figs',
    data: new SlashCommandBuilder()
        .setName('figs')
        .setDescription('Search Figura documentation.')
        .addStringOption(option => option.setName('query').setDescription('Search query'))
        .addUserOption(option => option.setName('target').setDescription('User to mention').setRequired(false)),
    description: 'Search Figura documentation.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {import('discord.js').CommandInteraction} interaction 
     */
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const target = interaction.options.getUser('target');
        if (!query) return interaction.reply({ content: 'Please specify search query.', ephemeral: true }).catch(console.ignore);

        await interaction.deferReply();

        const figsSearch = `https://applejuiceyy.github.io/figs/latest/search/?q=${encodeURIComponent(query)}`;
        const figsDoc = `https://applejuiceyy.github.io/figs/latest/${encodeURIComponent(query)}`;

        let displayDirectDoc = true;
        try {
            await got(figsDoc);
        }
        catch (error) {
            if (error.response.statusCode === 404) {
                displayDirectDoc = false;
            }
        }
        
        await interaction.editReply(
            (target ? `*Suggestion for ${target}*\n` : '') +
            (displayDirectDoc ? `[Documentation for ${query}](${figsDoc})` : `[Search for "${query}"](${figsSearch})`)).catch(console.ignore);
    },
};
