const Discord = require('discord.js');
const ContentBlocker = require('../util/contentBlocker');
const utility = require('../util/utility');
const DataStorage = require('../util/dataStorage');
const path = require('path');

/**
 * Filters a message using the scam content blocker
 * @param {import('discord.js').Message} message 
 */
module.exports.filter = async function (message) {
    if (DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('enable_scam_filter') != 'true') return;

    if (
        // ContentBlocker.scam(message.content) ||
        // ContentBlocker.scam(message.embeds[0]?.url) ||
        // ContentBlocker.scam(message.embeds[0]?.thumbnail?.url) ||
        ContentBlocker.scam((await ContentBlocker.expandMultipleUrls(utility.getURLs(message.content))).join()) ||
        ContentBlocker.matchesGenericScamMessage(message)
    ) {
        message.delete().catch(console.ignore);

        // Setting for clearing roles on mute, otherwise just going to add the muted role to the existing ones
        if (DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('clear_roles_on_mute') == 'true') {
            message.member.roles.set([DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('muted_role')]).catch(console.ignore);
        }
        else {
            message.member.roles.add(DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('muted_role')).catch(console.ignore);
        }

        message.guild.channels.fetch(DataStorage.guildsettings.guilds?.get(message.guild.id)?.get('mod_log_channel'))
            .then(channel => {
                channel.send({
                    embeds: [
                        {
                            title: 'Scam Filter',
                            fields: [
                                {
                                    name: 'User',
                                    value: `<@${message.author.id}> (${message.author.tag})`,
                                },
                                {
                                    name: 'Message',
                                    value: message.content == '' ? '[empty]' : message.content,
                                },
                            ],
                            color: 'ff5114',
                        },
                    ],
                }).catch(console.ignore);
            })
            .catch(console.ignore);
    }
};
