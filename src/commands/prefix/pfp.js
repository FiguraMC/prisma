const Discord = require('discord.js'); // eslint-disable-line no-unused-vars

module.exports = {
    name: 'pfp',
    usage: '`?pfp` - Update the bot\'s profile picture.',
    moderator: true,
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) {
        const url = message.attachments?.first()?.url;

        if (url) {
            message.client.user.setAvatar(url);
            message.reply('Avatar updated!');
        }
        else {
            message.reply('Please provide an image.');
        }
    },
};
