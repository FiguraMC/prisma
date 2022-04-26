const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const { SlashCommandBuilder } = require('@discordjs/builders');
const { startDialog, canStartDialog } = require('../../dialogs/startDialog');
const DataStorage = require('../../util/dataStorage');
const utility = require('../../util/utility');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Creates a Modmail Ticket.'),
    usage: '`/ticket` - Create a Modmail Ticket.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    async execute(interaction) {
        // Only allow this comamnd to be used in DM or in main guild
        if (interaction.guild?.id != undefined && interaction.guild?.id != process.env.MAIN_GUILD) {
            interaction.reply({ embeds: [{ description: 'Modmail is only available in our main server.' }], ephemeral: true });
            return;
        }
        if (canStartDialog(interaction.client, interaction.user)) {
            // Only one ticket per person can exist at the same time
            if (!DataStorage.storage.tickets?.find(x => x.author == interaction.user.id)) {
                try {
                    await interaction.user.send(utility.buildEmbed('Modmail Ticket', 'We will now ask for details, if you want to cancel this process just send "cancel". Your username will not be included in your ticket.'));
                }
                catch {
                    interaction.reply({ embeds: [{ description: 'I need to be able to DM you to ask for details.' }], ephemeral: true });
                    return;
                }
                startDialog(interaction.client, interaction.user, 'createTicket');
                interaction.reply({ embeds: [{ description: 'I have sent you a DM.' }], ephemeral: true });
            }
            else {
                interaction.reply({ embeds: [{ description: 'You already have an open ticket.' }], ephemeral: true });
            }
        }
        else {
            interaction.reply({ embeds: [{ description: 'Please finish the current dialog first.' }], ephemeral: true });
        }
    },
};
