const avatarRequestDialog = require('../avatarRequestDialog');

module.exports = {
    name: 'createAvatarRequest',
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @param {import('discord.js').TextChannel | import('discord.js').User} channel 
     * @param {*} dialog 
     */
    async handle(message, channel, dialog) {
        return (await avatarRequestDialog.handle(message, channel, dialog, { mode: 'create' }));
    },
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     * @param {*} dialog 
     */
    async handleInteraction(interaction, dialog) {
        return (await avatarRequestDialog.handleInteraction(interaction, dialog));
    },
};

