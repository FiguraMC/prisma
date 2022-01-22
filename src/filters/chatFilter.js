const ContentBlocker = require('../util/contentBlocker');
const utility = require('../util/utility');

module.exports.filter = async function (message) {
    if (
        ContentBlocker.scam(message.content) ||
        ContentBlocker.scam(message.embeds[0]?.url) ||
        ContentBlocker.scam(message.embeds[0]?.thumbnail?.url) ||
        ContentBlocker.scam((await ContentBlocker.expandMultipleUrls(utility.getURLs(message.content))).join())
    ) {
        message.delete().catch(console.error);

        if (process.env.CLEAR_ROLES_ON_MUTE.toLowerCase() === 'true') {
            message.member.roles.set([process.env.MUTED_ROLE]).catch(console.error);
        }
        else {
            message.member.roles.add(process.env.MUTED_ROLE).catch(console.error);
        }

        message.channel.send(
            '.　。　　　　•　　　ﾟ　　。　　.　　　　•\n' +
            '　　　.　　　　　.　　　　　。　　。　.　　.\n' +
            '。　　ඞ　　.　•　　Scammer was ejected...\n' +
            '。　.　　　　。　　　　　　ﾟ　　　.　　　　.\n' +
            '　　　　.　.　　　.　　　•　　.　　　　ﾟ　.\n',
        );

        const channel = await message.guild.channels.fetch(process.env.MODERATION_LOG_CHANNEL);
        channel.send({
            embeds: [
                {
                    title: 'Scam Filter',
                    fields: [
                        {
                            name: 'User',
                            value: `<@${message.author.id}> (${message.author.tag})`,
                        },
                        {
                            name: 'Message',
                            value: message.content == '' ? '[empty]' : message.content,
                        },
                    ],
                    color: 'ff5114',
                },
            ],
        });
    }
    else if (ContentBlocker.nsfw(message.content)) {
        message.delete().catch(console.error);
        message.channel.send('<@' + message.author.id + '> we don\'t do that here!');
        const channel = await message.guild.channels.fetch(process.env.MODERATION_LOG_CHANNEL);
        channel.send({
            embeds: [
                {
                    title: 'NSFW Filter',
                    description: 'Warned <@' + message.author.id + '>',
                    fields: [
                        {
                            name: 'Message',
                            value: message.content == '' ? '[empty]' : message.content,
                        },
                    ],
                    color: 'ff1469',
                },
            ],
        });
    }
};
