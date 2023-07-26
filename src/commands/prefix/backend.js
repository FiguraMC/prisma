const utility = require('../../util/utility');

module.exports = {
    name: 'backend',
    description: 'Checks Figura backend status.',
    allowInOtherGuilds: true,
    overloads: [
        {
            arguments: [],
            /**
             * 
             * @param {import('discord.js').Message} message 
             */
            async execute(message) {
                const msg = await message.channel.send({
                    embeds: [{
                        description: '**Backend Status**\n💻● ● ● ● ●🗄️',
                    }],
                });
                const status = await utility.checkBackendStatus(message.client);
                const icon = status ? '✅' : '❌';
                msg.edit({
                    embeds: [{
                        description: '**Backend Status**\n💻● ●' + icon + '● ●🗄️',
                    }],
                });
            },
        },
    ],
};
