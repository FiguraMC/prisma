const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const got = require('got');

module.exports = {
    name: 'connections',
    usage: '`?connections` - Show Figura backend connection stats.',
    moderator: true,
    /**
     * 
     * @param {Discord.Message} message 
     */
    async execute(message) {
        got('https://figuranew.blancworks.org/nginx_status/', {
            https: {
                rejectUnauthorized: false,
            },
        })
            .then(res => {
                if (res.statusCode == 200) {
                    message.channel.send({ embeds:[{
                        description: res.body,
                    }] }).catch(console.error);
                }
                else {
                    message.channel.send({ embeds:[{
                        description: 'Status code ' + res.statusCode,
                    }] }).catch(console.error);
                }
            })
            .catch(err => {
                message.channel.send({ embeds:[{
                    description: 'Status code ' + err.response.statusCode,
                }] }).catch(console.error);
            });
    },
};
