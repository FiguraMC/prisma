const { startDialog, canStartDialog } = require('../dialogs/startDialog');
const DataStorage = require('../util/dataStorage');
const utility = require('../util/utility');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

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
        else if (interaction.isButton()) {
            if (interaction.customId == 'new_avatar_request') {
                interaction.deferUpdate().catch(console.error);
                if (DataStorage.storage.people[interaction.user.id]?.requestban) return interaction.user.send(utility.buildEmbed('Sorry, you can\'t create a request at the moment.'));

                if (canStartDialog(interaction.client, interaction.user)) {
                    await interaction.user.send(utility.buildEmbed('New Avatar Request', 'We will now fill in the details of the request. Take your time to read the descriptions to ensure to make a high quality request. Low quality ones might get deleted by a moderator. You can type "cancel" at any point if you make a mistake.', []));
                    startDialog(interaction.client, interaction.user, 'createAvatarRequest');
                }
                else {
                    interaction.user.send(utility.buildEmbed('Please finish the current dialog first.'));
                }
            }
            else if (interaction.customId == 'ticket_buttons') {
                if (interaction.message?.thread) {
                    const updatedEmbed = interaction.message.embeds[0];
                    if (updatedEmbed) updatedEmbed.title = '🔒' + updatedEmbed.title.substring(1);
                    interaction.update({ embeds: [updatedEmbed], components: [] }).catch(console.error);
                    const ticket = DataStorage.storage.tickets?.find(x => x.thread == interaction.message.thread.id);
                    const author = await interaction.guild.members.fetch(ticket?.author).catch(console.error);
                    author?.send(utility.buildEmbed('🔒 Your ticket has been closed.')).catch(console.error);
                    DataStorage.storage.tickets = DataStorage.storage.tickets?.filter(x => x.thread != interaction.message.thread.id);
                    DataStorage.save();
                    interaction.message.thread.setArchived(true);
                }
            }
        }
    },
};
