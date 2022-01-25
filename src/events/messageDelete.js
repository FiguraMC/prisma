const PKAPI = require('pkapi.js');
const pkapi = new PKAPI();

module.exports = {
    name: 'messageDelete',
    async execute(message) {

        // Log delete in the log channel

        if (!message.guild) return; // Ignore DM
        if (message.author.id == message.client.user.id) return; // Ignore self

        // Check audit log to see who deleted the message
        const fetchedLogs = await message.guild.fetchAuditLogs({
            limit: 1,
            type: 'MESSAGE_DELETE',
        });
        const deletionLog = fetchedLogs.entries.first();

        let personWhoDeleted;

        let executor = undefined;
        let target = undefined;

        // this can sometimes not be accurate because some stuff doesnt show up in the audit log
        if (deletionLog) {
            executor = deletionLog.executor;
            target = deletionLog.target;
            if (target.id == message.author.id) {
                personWhoDeleted = '<@' + executor.id + '>';
            }
            else {
                personWhoDeleted = 'themselves';
            }
        }
        else {
            personWhoDeleted = 'an unknown user';
        }

        const pk_message = await pkapi.getMessage({ id: message.id });
        if (pk_message?.original == message.id) return; // Ignore Pluralkit

        const channel = await message.guild.channels.fetch(process.env.LOG_CHANNEL);
        channel.send({
            embeds: [
                {
                    author: { name: message.author.username, iconURL: message.author.avatarURL() },
                    description: 'Message from <@' + message.author + '> deleted by ' + personWhoDeleted + ' in <#' + message.channel + '>',
                    fields: [
                        {
                            name: 'Message',
                            value: message.content == '' ? '[empty]' : message.content,
                        },
                    ],
                    image: { url: message.attachments.values()?.next()?.value?.attachment },
                    color: 'ff0000',
                },
            ],
        });
    },
};
