const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const DataStorage = require('../util/dataStorage');

module.exports = {
    name: 'messageUpdate',
    /**
     * 
     * @param {Discord.Message} oldMessage 
     * @param {Discord.Message} newMessage 
     */
    async execute(oldMessage, newMessage) {

        // Log update in the log channel

        if (!oldMessage.guild) return; // Ignore DM

        if (DataStorage.guildsettings.guilds?.get(oldMessage.guild.id)?.get('enable_message_logging') != 'true') return; // Ignore if logging is disabled
        if (oldMessage.author.id == oldMessage.client.user.id) return; // Ignore self

        if (oldMessage.content == newMessage.content) return; // in order to stop link embeds from triggering this event
        if (oldMessage.guild != newMessage.guild) return;

        if (oldMessage.content.length > 1024) {
            oldMessage.content = oldMessage.content.substring(0, 1017) + '`[...]`';
        }
        if (newMessage.content.length > 1024) {
            newMessage.content = newMessage.content.substring(0, 1017) + '`[...]`';
        }

        oldMessage.guild.channels.fetch(DataStorage.guildsettings.guilds?.get(oldMessage.guild.id)?.get('log_channel'))
            .then(channel => {
                channel.send({
                    embeds: [
                        {
                            author: { name: oldMessage.author.username, iconURL: oldMessage.author.avatarURL() },
                            description: '[Message](' + oldMessage.url + ') from <@' + oldMessage.author + '> edited in <#' + oldMessage.channel + '>',
                            fields: [
                                {
                                    name: 'Old',
                                    value: oldMessage.content == '' ? '[empty]' : oldMessage.content,
                                    inline: true,
                                },
                                {
                                    name: 'New',
                                    value: newMessage.content == '' ? '[empty]' : newMessage.content,
                                    inline: true,
                                },
                            ],
                            image: { url: oldMessage.attachments.values()?.next()?.value?.attachment },
                            color: '0875db',
                        },
                    ],
                }).catch(console.error);
            })
            .catch(console.error);
    },
};
