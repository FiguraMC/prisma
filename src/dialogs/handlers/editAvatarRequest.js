const avatarRequestDialog = require('../avatarRequestDialog');

module.exports = {
    name: 'editAvatarRequest',
    async handle(message, channel, dialog) {
        return (await avatarRequestDialog.handle(message, channel, dialog, { mode: 'edit', msg: dialog.extras }));
    },
    async handleInteraction(interaction, dialog) {
        return (await avatarRequestDialog.handleInteraction(interaction, dialog));
    },
};
