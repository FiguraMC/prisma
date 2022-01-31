const utility = require('../util/utility');

module.exports.filter = async function (message) {
    if (process.env.SHOWCASE_CHANNELS.split(',').find(x => x == message.channel.id)) {

        // if sent in a showcase channel, check if it contains an attachment or link or code block
        if (message.attachments.size == 0 && utility.getURLs(message.content) == null && !message.content?.includes('```')) {
            message.delete().catch(console.error);
            message.author.send(utility.buildEmbed(
                'Hello there!',
                'To respond to a showcased post please talk in the dedicated discussion channel.\n' +
                'If you want to post something to showcase yourself, make sure to include an image, video, file, or URL.',
            )).catch(console.error);
        }
        else {
            // React to showcase post with the upvote button emoji
            const messages = await message.channel.messages.fetch();
            const aboveMessage = messages.first(2)[1];
            if (aboveMessage?.author.id == message.author.id) {
                aboveMessage.reactions.cache.get(process.env.UPVOTE_EMOJI)?.users.remove(message.client.user.id);
            }
            message.react(process.env.UPVOTE_EMOJI).catch(console.error);
        }
    }
};
