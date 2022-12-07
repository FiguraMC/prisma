const { Permissions } = require('discord.js');
const Argument = require('../parser/argument');

module.exports = {
    name: 'pin',
    description: 'Pin/unpin a message to/from a thread.',
    allowInOtherGuilds: false,
    overloads: [
        {
            arguments: [new Argument('message', 'message')],
            /**
             * @param {import('discord.js').Message} message 
             * @param {import('../parser/argumentContainer')} args
             */
            async execute(message, args) {
                const messageToPin = args.getValue('message');
                const thread = messageToPin.channel.isThread ? messageToPin.channel : await messageToPin.channel.threads?.fetch(messageToPin.id);
                if (
                    message.author.id != thread.ownerId &&
                    !message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) &&
                    !thread.permissionsFor(message.member).has(Permissions.FLAGS.MANAGE_MESSAGES)
                ) {
                    return message.reply('Only the owner of this channel can pin messages.');
                }
                if (messageToPin.pinned) {
                    messageToPin.unpin();
                    message.reply('I unpinned the message for you!');
                }
                else {
                    messageToPin.pin();
                }
            },
        },
    ],
};
