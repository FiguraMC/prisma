const avatarRequestDialog = require('../avatarRequestDialog');

module.exports = {
    name: 'createAvatarRequest',
    async handle(message, channel, dialog) {
        return (await avatarRequestDialog.handle(message, channel, dialog, { mode: 'create' }));
    },
    async handleInteraction(interaction, dialog) {
        return (await avatarRequestDialog.handleInteraction(interaction, dialog));
    },
};

