const Argument = require('../parser/argument');
const { extractAndFormatLuaCode } = require('../../util/lua');

module.exports = {
    name: 'format',
    description: 'Format lua code.',
    allowInOtherGuilds: true,
    overloads: [
        {
            arguments: [new Argument('message', 'message')],
            /**
             * @param {import('discord.js').Message} message 
             * @param {import('../parser/argumentContainer')} args
             */
            async execute(message, args) {
                const messageToFormat = args.getValue('message');
                message.reply(extractAndFormatLuaCode(messageToFormat.content));
            },
        },
    ],
};
