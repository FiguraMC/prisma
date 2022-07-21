module.exports = {
    name: 'pfp',
    description: 'Update the bot\'s profile picture.',
    moderator: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
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
