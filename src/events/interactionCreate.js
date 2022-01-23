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
        }
    },
};
