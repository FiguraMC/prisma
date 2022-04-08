const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const utility = require('../../util/utility');

module.exports = {
    name: 'backend',
    usage: '`?backend` - Checks Figura backend status.',
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) {
        const msg = await message.channel.send({
            content: 'Backend Status', embeds: [{
                description: '💻● ● ● ● ●🗄️',
            }],
        });
        const status = await utility.getBackendStatus();
        const icon = status ? '✅' : '❌';
        msg.edit({
            content: 'Backend Status', embeds: [{
                description: '💻● ●' + icon + '● ●🗄️',
            }],
        });
        const text = status ? 'Online✅' : 'Offline❌';
        const channel = await message.client.channels.fetch(process.env.BACKEND_STATUS_CHANNEL);
        channel.setName('Backend: ' + text).catch(console.error);
    },
};
