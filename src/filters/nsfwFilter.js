const ContentBlocker = require('../util/contentBlocker');
const DataStorage = require('../util/dataStorage');

/**
 * Filters a message using the nsfw content blocker
 * @param {import('discord.js').Message} message 
 */
module.exports.filter = async function (message) {
    if (message.guild.id == process.env.MAIN_GUILD && ContentBlocker.nsfw(message.content)) {
        message.delete().catch(console.ignore);
        message.channel.send('<@' + message.author.id + '> we don\'t do that here!');
        message.guild.channels.fetch(DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('mod_log_channel'))
            .then(channel => {
                channel.send({
                    embeds: [
                        {
                            title: 'NSFW Filter',
                            description: 'Warned <@' + message.author.id + '>',
                            fields: [
                                {
                                    name: 'Message',
                                    value: message.content == '' ? '[empty]' : message.content,
                                },
                            ],
                            color: 'ff1469',
                        },
                    ],
                }).catch(console.ignore);
            })
            .catch(console.ignore);
    }
};
