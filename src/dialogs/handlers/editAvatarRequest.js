const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const avatarRequestDialog = require('../avatarRequestDialog');

module.exports = {
    name: 'editAvatarRequest',
    /**
     * 
     * @param {Discord.Message} message 
     * @param {Discord.TextChannel | Discord.User} channel 
     * @param {*} dialog 
     */
    async handle(message, channel, dialog) {
        return (await avatarRequestDialog.handle(message, channel, dialog, { mode: 'edit', msg: dialog.extras }));
    },
    /**
     * 
     * @param {Discord.Interaction} interaction 
     * @param {*} dialog 
     */
    async handleInteraction(interaction, dialog) {
        return (await avatarRequestDialog.handleInteraction(interaction, dialog));
    },
};
