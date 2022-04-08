const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const CronJob = require('cron').CronJob;
const utility = require('../util/utility');

/**
 * Check backend status every 10 minutes
 * and update the status channel
 * @param {Discord.Client} client 
 */
module.exports.start = async function (client) {
    const job = new CronJob('0 */10 * * * *', async function () {
        const status = await utility.getBackendStatus();
        const icon = (status) ? 'Online✅' : 'Offline❌';
        const channel = await client.channels.fetch(process.env.BACKEND_STATUS_CHANNEL);
        channel.setName('Backend: ' + icon);
    }, null, true, 'Europe/London');
    job.start();
};
