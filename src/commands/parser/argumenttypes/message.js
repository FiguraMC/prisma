const CommandParseError = require('../commandParseError');
const Discord = require('discord.js');

module.exports = {
    type: 'message',
    validate: async (value, options, commandMessage) => {
        if (value instanceof Discord.Message) return value;
        if (typeof value == 'string') {
            let messageId = value;
            let channel = commandMessage.channel;
            if (value.includes('-')) {
                const split = value.split('-');
                const channelId = split[0];
                messageId = split[1];
                try {
                    channel = await commandMessage.guild.channels.fetch(channelId) || options.channel;
                }
                catch {
                    throw new CommandParseError('Invalid channel id.');
                }
            }
            try {
                return await channel.messages.fetch(messageId);
            }
            catch {
                throw new CommandParseError('Invalid message id. Maybe you forgot to specify a channel?');
            }
        }
        throw new CommandParseError('This is not a valid message.');
    },
};
