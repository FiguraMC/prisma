const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const got = require('got');

module.exports = {
    name: 'backend',
    usage: '`?backend` - Checks Figura backend status.',
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) {
        const msg = await message.channel.send({ content:'Backend Status', embeds:[{
            description: '💻● ● ● ● ●🗄️',
        }] });
        got('https://figuranew.blancworks.org/connect/', {
            https: {
                rejectUnauthorized: false,
            },
        })
            .then(res => {
                if (res.statusCode != 200) {
                    msg.edit({ content:'Backend Status', embeds:[{
                        description: '💻● ●❌● ●🗄️',
                    }] });
                }
                else {
                    msg.edit({ content:'Backend Status', embeds:[{
                        description: '💻● ●✅● ●🗄️',
                    }] });
                }
            })
            .catch(() => {
                msg.edit({ content:'Backend Status', embeds:[{
                    description: '💻● ●❌● ●🗄️',
                }] });
            });
    },
};
