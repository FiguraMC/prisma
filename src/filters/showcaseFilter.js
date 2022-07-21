const utility = require('../util/utility');

/**
 * 
 * @param {import('discord.js').Message} message 
 */
module.exports.filter = async function (message) {
    if (message.guild.id == process.env.MAIN_GUILD && process.env.SHOWCASE_CHANNELS.split(',').find(x => x == message.channel.id)) {

        if (message.author.id == '466378653216014359') { // PluralKit ID
            setTimeout(() => {
                message.delete().catch(console.error); // Wait a bit before deletion so the user can see the PluralKit error message
            }, 7000);
            return;
        }

        // if sent in a showcase channel, check if it contains an attachment or link or code block
        if (message.attachments.size == 0 && utility.getURLs(message.content) == null && !message.content?.includes('```')) {
            if (message.content?.toLowerCase().startsWith('pk;')) { // PluralKit command
                setTimeout(() => {
                    message.delete().catch(console.error); // In case PluralKit didn't already remove the message, remove it now
                }, 7000);
            }
            else {
                message.delete().catch(console.error);
                message.author.send(utility.buildEmbed(
                    'Hello there!',
                    'To respond to a showcased post please talk in the dedicated discussion channel.\n' +
                    'If you want to post something to showcase yourself, make sure to include an image, video, file, or URL.',
                )).catch(console.error);
            }
        }
        else {
            // React to showcase post with the upvote button emoji
            message.react(process.env.UPVOTE_EMOJI).catch(console.error);
            // Wait a bit before removing the above reaction to let PluralKit finish
            setTimeout(async () => {
                const messages = await message.channel.messages.fetch();
                const aboveMessage = messages.first(2)[1];
                if (aboveMessage?.author.id == message.author.id) {
                    aboveMessage.reactions.cache.get(process.env.UPVOTE_EMOJI)?.users.remove(message.client.user.id);
                }
            }, 4000);
        }
    }
};
