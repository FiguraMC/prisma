module.exports = {
    name: 'threadUpdate',
    /**
     * 
     * @param {import('discord.js').ThreadChannel} oldChannel 
     * @param {import('discord.js').ThreadChannel} newChannel 
     */
    async execute(oldChannel, newChannel) {
        // Remove Unresolved tag if a Resolved tag has been added
        if (newChannel.guild.id == process.env.MAIN_GUILD && newChannel.isThread() && process.env.HELP_CHANNELS.split(',').find(x => x == newChannel.id || x == newChannel.parentId)) {
            const resolved_tags = process.env.RESOLVED_TAGS.split(',');
            let isResolved = false;
            for (const tag of resolved_tags) {
                isResolved = isResolved || newChannel.appliedTags.includes(tag);
            }
            let newTags = newChannel.appliedTags;
            // If resolved, remove the unresolved tag
            if (isResolved) {
                newTags = newTags.filter(x => x != process.env.UNRESOLVED_TAG);
            }
            // Only allow one of the resolved tags at the same time
            const addedTags = newChannel.appliedTags.filter(x => !oldChannel.appliedTags.includes(x));
            for (const addedTag of addedTags) {
                if (resolved_tags.includes(addedTag)) {
                    newTags = newTags.filter(x => !resolved_tags.includes(x) || x == addedTag);
                }
            }
            // Only setAppliedTags if we have changes
            if (!newChannel.appliedTags.every(x => newTags.includes(x))) {
                newChannel.setAppliedTags(newTags);
            }
        }
    },
};
