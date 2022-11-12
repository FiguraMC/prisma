const utility = require('../../util/utility');

module.exports = {
    name: 'backend',
    description: 'Checks Figura backend status.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        const msg = await message.channel.send({
            content: 'Backend Status', embeds: [{
                description: '**0.1.0 Backend**\n💻● ● ● ● ●🗄️',
            }],
        });
        const status = await utility.checkBackendStatus(message.client);
        const icon = status ? '✅' : '❌';
        msg.edit({
            content: 'Backend Status', embeds: [{
                description: '**0.1.0 Backend**\n💻● ●' + icon + '● ●🗄️',
            }],
        });
    },
};
