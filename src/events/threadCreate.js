module.exports = {
    name: 'threadCreate',
    /**
     * 
     * @param {import('discord.js').ThreadChannel} channel 
     */
    async execute(channel) {
        // Add the required help forum channel tag on each new post
        if (channel.guild.id == process.env.MAIN_GUILD && channel.isThread() && process.env.HELP_CHANNELS.split(',').find(x => x == channel.id || x == channel.parentId)) {
            if (!channel.appliedTags.includes(process.env.UNRESOLVED_TAG)) {
                channel.setAppliedTags(channel.appliedTags.concat([process.env.UNRESOLVED_TAG]));
            }
        }
    },
};
