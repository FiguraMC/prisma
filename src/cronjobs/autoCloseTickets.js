const CronJob = require('cron').CronJob;
const DataStorage = require('../util/dataStorage');
const utility = require('../util/utility');

/**
 * Automatically close tickets older than 30 days and check once a day
 * @param {import('discord.js').Client} client 
 */
module.exports.start = function (client) {
    const job = new CronJob('0 0 0 * * *', function () {
        if (!DataStorage.storage.tickets) return;
        if (DataStorage.storage.tickets.length == 0) return;

        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        client.channels.fetch(process.env.TICKET_CHANNEL).then(async (channel) => {
            if (!channel) return;
            for (const ticket of DataStorage.storage.tickets) {
                if (!ticket.created) return;
                if (ticket.created < thirtyDaysAgo) {
                    const message = await channel.messages.fetch(ticket.message);
                    if (!message) return;
                    const updatedEmbed = message.embeds[0];
                    if (updatedEmbed) updatedEmbed.title = '🔒' + updatedEmbed.title.substring(1);
                    message.edit({ embeds: [updatedEmbed], components: [] });
                    // Notify user, archive thread and delete ticket from storage
                    const author = await message.guild.members.fetch(ticket?.author);
                    author?.send(utility.buildEmbed('🔒 Your ticket has been closed.'));
                    DataStorage.storage.tickets = DataStorage.storage.tickets?.filter(x => x.thread != message.thread.id);
                    DataStorage.save('storage');
                    await message.thread.send(utility.buildEmbed('🔒 Ticket has been closed.'));
                    message.thread.setArchived(true);
                }
            }
        }).catch(console.ignore);

    }, null, true, 'Europe/London');
    job.start();
};
