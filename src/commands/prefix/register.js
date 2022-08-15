const Argument = require('../parser/argument');
const DataStorage = require('../../util/dataStorage');
const { createCollector } = require('../../util/requestReactions');

module.exports = {
    name: 'register',
    description: 'Register a lost avatar request.',
    moderator: true,
    overloads: [
        {
            arguments: [new Argument('message id', 'string'), new Argument('author', 'user')],
            /**
             * @param {import('discord.js').Message} message 
             * @param {import('../parser/argumentContainer')} args
             */
            async execute(message, args) {
                try {
                    const channel = await message.client.channels.fetch(process.env.REQUESTS_CHANNEL);
                    const msg = await channel.messages.fetch(args.getValue('message id'));

                    const locked = msg.reactions.resolve('⚙️').count > 1;
                    msg.embeds.forEach(embed => {
                        embed.color = locked ? 'f28a2e' : '202225'; // orange, gray
                    });
                    msg.edit({ embeds: msg.embeds });

                    const element = { message: msg.id, user: args.getValue('author').id, timestamp: msg.createdTimestamp, locked: locked, thread: msg.id };
                    if (!DataStorage.storage.avatar_requests) DataStorage.storage.avatar_requests = [];
                    DataStorage.storage.avatar_requests.push(element);
                    DataStorage.save('storage');
                    await createCollector(msg, element);

                    return message.reply('Avatar request registered.');
                }
                catch {
                    return message.reply('Could not find this message.');
                }
            },
        },
    ],
};
