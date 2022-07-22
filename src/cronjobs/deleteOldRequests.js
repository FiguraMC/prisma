const CronJob = require('cron').CronJob;
const DataStorage = require('../util/dataStorage');

/**
 * Set up cron job to check for old requests every hour
 * @param {import('discord.js').Client} client 
 */
module.exports.start = function (client) {
    const job = new CronJob('0 0 * * * *', function () {
        deleteOldRequests(client);
    }, null, true, 'Europe/London');
    job.start();
};

/**
 * Checks the requests channel and deletes requests older than a week
 * Also updates color of requests that are older than a day
 * @param {import('discord.js').Client} client 
 */
async function deleteOldRequests(client) {
    const channel = await client.channels.fetch(process.env.REQUESTS_CHANNEL).catch(console.ignore);

    if (!DataStorage.storage.avatar_requests) DataStorage.storage.avatar_requests = [];

    DataStorage.storage.avatar_requests.forEach(async element => {
        if (!element.locked) {
            const msg = await channel.messages.fetch(element.message).catch(console.ignore);

            if (element.timestamp + 1000 * 60 * 60 * 24 * 7 < Date.now()) { // older than 7 days
                // delete message
                if (msg != undefined) {
                    const user = await client.users.fetch(element.user).catch(console.ignore);
                    if (user != undefined) user.send({ content: 'Your request has been deleted. We delete the ones older than 1 week to keep the channel clean.\nYour request:', embeds: msg.embeds }).catch(console.ignore);
                    for (const e of msg.embeds) e.setColor('f24671'); // pink
                    client.channels.fetch(process.env.LOG_CHANNEL)
                        .then(c => c.send({ content: 'Request automatically deleted:', embeds: msg.embeds }).catch(console.ignore))
                        .catch(console.ignore);
                    msg.delete().catch(console.ignore);
                }
                // delete from storage
                DataStorage.deleteFromArray(DataStorage.storage.avatar_requests, element);
                DataStorage.save('storage');
            }
            else {
                let edit = false;
                if (element.timestamp + 1000 * 60 * 60 * 24 < Date.now()) { // older than a day
                    msg.embeds.forEach(embed => {
                        if (embed.color != 2105893) { // gray but as int
                            edit = true;
                            embed.color = '202225'; // older than 24h gray
                        }
                    });
                }
                else {
                    msg.embeds.forEach(embed => {
                        if (embed.color != 2796791) { // blue but as int
                            edit = true;
                            embed.color = '2aacf7'; // newer than 24h blue
                        }
                    });
                }
                if (edit) msg.edit({ embeds: msg.embeds }).catch(console.ignore);
            }
        }
    });
}
