const { startDialog, canStartDialog } = require('../dialogs/startDialog');
const DataStorage = require('../util/dataStorage');
const utility = require('../util/utility');
const confirmationButtons = require('../components/confirmationButtons');
const closeTicketButton = require('../components/closeTicketButton');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

        // Handle slash commands
        if (interaction.isCommand()) {
            const command = interaction.client.slashCommands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!' }).catch(console.error);
            }
        }
        // Handle buttons
        else if (interaction.isButton()) {
            // New avatar request button at the bottom of the requests channel
            if (interaction.customId == 'new_avatar_request') {
                // Update button so it doesnt timeout
                interaction.deferUpdate().catch(console.error);
                // Check bans
                if (DataStorage.storage.people[interaction.user.id]?.requestban) return interaction.user.send(utility.buildEmbed('Sorry, you can\'t create a request at the moment.'));

                // Attempt to start avatar request creation dialog
                if (canStartDialog(interaction.client, interaction.user)) {
                    await interaction.user.send(utility.buildEmbed('New Avatar Request', 'We will now fill in the details of the request. Take your time to read the descriptions to ensure to make a high quality request. Low quality ones might get deleted by a moderator. You can type "cancel" at any point if you make a mistake.', []));
                    startDialog(interaction.client, interaction.user, 'createAvatarRequest');
                }
                else {
                    interaction.user.send(utility.buildEmbed('Please finish the current dialog first.'));
                }
            }
            // Close ticket button attached to each ticket
            // Replaces itself with the two confirmation buttons
            else if (interaction.customId == 'close_ticket_button') {
                interaction.update({ embeds: interaction.message.embeds, components: [confirmationButtons] });
            }
            // Confirm close ticket
            else if (interaction.customId == 'close_ticket_confirmation_button_yes') {
                if (interaction.message?.thread) {
                    // Update visuals and remove buttons
                    const updatedEmbed = interaction.message.embeds[0];
                    if (updatedEmbed) updatedEmbed.title = '🔒' + updatedEmbed.title.substring(1);
                    interaction.update({ embeds: [updatedEmbed], components: [] }).catch(console.error);
                    // Notify user, archive thread and delete ticket from storage
                    const ticket = DataStorage.storage.tickets?.find(x => x.thread == interaction.message.thread.id);
                    const author = await interaction.guild.members.fetch(ticket?.author).catch(console.error);
                    author?.send(utility.buildEmbed('🔒 Your ticket has been closed.')).catch(console.error);
                    DataStorage.storage.tickets = DataStorage.storage.tickets?.filter(x => x.thread != interaction.message.thread.id);
                    DataStorage.save();
                    interaction.message.thread.setArchived(true);
                }
            }
            // Cancel close ticket
            // Replaces itself with the close ticket button
            else if (interaction.customId == 'close_ticket_confirmation_button_no') {
                interaction.update({ embeds: interaction.message.embeds, components: [closeTicketButton] });
            }
        }
    },
};