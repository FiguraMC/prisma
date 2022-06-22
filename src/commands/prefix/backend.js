const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const utility = require('../../util/utility');

module.exports = {
    name: 'backend',
    usage: '`?backend` - Checks Figura backend status.',
    allowInOtherGuilds: true,
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) {
        const msg = await message.channel.send({
            content: 'Backend Status', embeds: [{
                description: '**0.0.8 Backend**\n💻● ●❓● ●🗄️\n\n**0.1.0 Backend**\n💻● ● ● ● ●🗄️',
            }],
        });
        const status = await utility.checkBackendStatus(message.client);
        const icon = status ? '✅' : '❌';
        msg.edit({
            content: 'Backend Status', embeds: [{
                description: '**0.0.8 Backend**\n💻● ●❓● ●🗄️\n\n**0.1.0 Backend**\n💻● ●' + icon + '● ●🗄️',
            }],
        });
    },
};
