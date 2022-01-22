const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Creates a Modmail Ticket.'),
    usage: '`/ticket` - Create a Modmail Ticket.',
    async execute(interaction) {
        // TODO: Modmail Tickets
        await interaction.reply('Modmail Ticket.').catch(console.error);
    },
};
