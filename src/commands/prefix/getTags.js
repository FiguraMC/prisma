module.exports = {
    name: 'gettags',
    description: 'Get the tag IDs of this forum post.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        if (message.channel.isThread() && message.channel.appliedTags?.length > 0) {
            message.reply(message.channel.appliedTags.toString());
        }
        else {
            message.reply('Couldn\'t get tags.');
        }
    },
};
