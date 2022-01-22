const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wiki')
        .setDescription('Search Figura Wiki.'),
    usage: '`/wiki <search>` - Search Figura Wiki.',
    async execute(interaction) {
        // TODO: Wiki
        await interaction.reply('The Wiki is being reworked. Try again later.').catch(console.error);
    },
};
