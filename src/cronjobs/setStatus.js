const CronJob = require('cron').CronJob;

/**
 * Update status every day
 */
module.exports.start = function (client) {
    const job = new CronJob('0 0 0 * * *', function () {
        client.user.setActivity('/ticket', { type: 'LISTENING' });
    }, null, true, 'Europe/London');
    job.start();
};
