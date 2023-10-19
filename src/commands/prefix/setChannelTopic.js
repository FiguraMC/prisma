const Argument = require('../parser/argument');

module.exports = {
    name: 'setChannelTopic',
    description: 'Set channel topic of current channel, for compatibility with showing online helpers.',
    allowInOtherGuilds: true,
    moderator: true,
    overloads:[
        {
            arguments: [new Argument('topic', 'string')],
            /**
             * @param {import('discord.js').Message} message
             * @param {import('../parser/argumentContainer')} args
             */
            execute: async (message, args) => {
                if (message.channel.topic.includes(' - ')) {
                    const oldTopic = message.channel.topic.split(' - ');
                    message.channel.setTopic(oldTopic[0] + ' - ' + args.getValue('topic'));
                }
                else {
                    message.channel.setTopic(args.getValue('topic'));
                }
            },
        },
    ],
};
